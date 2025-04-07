import connectDb from "@/models/connectDb";
import {CounterModel} from "@/models/counter";
import {FYCounterModel} from "@/models/fyCounter";
import {Invoice} from "@/models/invoice";
import mongoose from "mongoose";
import {NextApiRequest, NextApiResponse} from "next";
import {getFinYear} from "@/lib/utils";

// const getNextSequenceValue = async (sequenceName: any) => {
//   const counter = await CounterModel.findOneAndUpdate(
//     {_id: sequenceName},
//     {$inc: {seq: 1}},
//     {new: true, upsert: true} // Create document if it doesn't exist
//   );
//   return counter.seq;
// };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {method} = req;

  await connectDb();

  switch (method) {
    case "GET":
      try {
        const invoices = await Invoice.find({}).sort({_id: 1});
        res.status(200).json({success: true, data: invoices});
      } catch (error) {
        res.status(400).json({success: false});
      }
      break;
    case "POST":
      try {
        // const invoice = await Invoice.create(req.body);
        // res.status(201).json({success: true, data: invoice});
        if (req.headers["x-bulk-operation"] === "true") {
          await handleBulkInsert(req, res);
        } else {
          await handleSingleInsert(req, res);
        }
      } catch (error: any) {
        console.error(error.message);
        if (error.name === "ValidationError") {
          res.status(200).json({message: error.message});
        } else {
          res.status(500).json({message: "Internal server error"});
        }
      }
      break;
    default:
      res.status(400).json({success: false});
      break;
  }
}

async function handleSingleInsert(req: NextApiRequest, res: NextApiResponse) {
  const session = await mongoose.startSession(); // Start a session
  session.startTransaction(); // Start a transaction

  try {
    // Increment both counters
    const counter = await CounterModel.findByIdAndUpdate(
      {_id: "Invoice._id"}, // Counter identifier
      {$inc: {seq: 1}}, // Increment sequence
      {new: true, upsert: true, session} // Ensure atomicity with session
    );

    if (!counter) {
      throw new Error("Failed to increment counter");
    }

    // Get current financial year
    const fy = getFinYear(
      req.body.IDate ? new Date(req.body.IDate) : new Date()
    );

    // Increment FY-specific counter
    const fyCounter = await FYCounterModel.findByIdAndUpdate(
      {_id: fy},
      {$inc: {seq: 1}},
      {new: true, upsert: true, session}
    );

    if (!fyCounter) {
      throw new Error("Failed to increment FY counter");
    }

    // Create the invoice number in the format YY-YY/XXX
    const invNo = `${fy}/${String(fyCounter.seq).padStart(3, "0")}`;

    // Assign both IDs to the invoice
    const newInvoiceData = {
      ...req.body,
      _id: counter.seq,
      invNo: invNo,
    };

    // Save the invoice
    const invoice = await Invoice.create([newInvoiceData], {session});

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Send success response
    res.status(201).json({success: true, data: invoice});
  } catch (error: any) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();

    // Error handling
    if (error instanceof mongoose.Error.ValidationError) {
      const missingFields = [];
      for (const [key, value] of Object.entries(error.errors)) {
        if (value.kind === "required") {
          missingFields.push(key);
        }
      }

      if (missingFields.length > 0) {
        return res.status(400).send({
          message:
            "Validation Error, missing required fields: " +
            missingFields.join(", "),
          errorType: "Missing Required Fields",
          missingFields: missingFields,
        });
      }

      return res.status(400).send({
        message: "Validation Error",
        details: error.errors,
      });
    } else if (error instanceof mongoose.Error.CastError) {
      return res.status(400).send({
        message: `Cast Error: ${error.message}`,
        field: error.path,
      });
    } else if (error.code === 11000 || error.code === 11001) {
      const field = Object.keys(error.keyValue);
      return res.status(409).send({
        message: `Duplicate value for field: ${field}`,
        field: field,
        value: error.keyValue.field,
      });
    } else if (error instanceof mongoose.Error.DocumentNotFoundError) {
      return res.status(404).send({
        message: "Document Not Found",
        details: error.message,
      });
    } else {
      return res.status(500).send({
        message: "Some Error has occurred, please try again",
        error: error.message,
      });
    }
  }
}

async function handleBulkInsert(req: NextApiRequest, res: NextApiResponse) {
  const invoices = req.body;

  if (!Array.isArray(invoices)) {
    return res
      .status(400)
      .json({message: "Data should be an array of vendors"});
  }

  try {
    const counter = await CounterModel.findOne({_id: "Invoice._id"});
    const seqNo = counter.seq;
    for (let index = 0; index < invoices.length; index++) {
      invoices[index]._id = seqNo + 1 + index;
    }
    console.log("INVOICES:" + invoices.map((invoice) => invoice._id));
    await Invoice.insertMany(invoices);
    await CounterModel.findOneAndUpdate(
      {_id: "Invoice._id"},
      {$inc: {seq: invoices.length}},
      {new: true, upsert: true} // Create document if it doesn't exist
    );
    res
      .status(201)
      .json({success: true, message: "Invoices created successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Internal server error during bulk insert"});
  }
}
