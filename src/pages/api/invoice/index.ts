import connectDb from "@/models/connectDb";
import {CounterModel} from "@/models/counter";
import {Invoice} from "@/models/invoice";
import {NextApiRequest, NextApiResponse} from "next";

const getNextSequenceValue = async (sequenceName: any) => {
  const counter = await CounterModel.findOneAndUpdate(
    {_id: sequenceName},
    {$inc: {seq: 1}},
    {new: true, upsert: true} // Create document if it doesn't exist
  );
  return counter.seq;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {method} = req;

  await connectDb();

  switch (method) {
    case "GET":
      try {
        const invoices = await Invoice.find({});
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
  try {
    const invoice = await Invoice.create(req.body);
    res.status(201).json({success: true, data: invoice});
  } catch (error: any) {
    if (error.name === "ValidationError") {
      res.status(400).json({message: error.message});
    } else {
      res.status(500).json({message: "Internal server error"});
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
    for (const invoice of invoices) {
      invoice._id = await getNextSequenceValue("Invoice._id");
    }
    console.log("INVOICES:" + invoices.map((invoice) => invoice._id));
    await Invoice.insertMany(invoices);
    res
      .status(201)
      .json({success: true, message: "Invoices created successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Internal server error during bulk insert"});
  }
}
