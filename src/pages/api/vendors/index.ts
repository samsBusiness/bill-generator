import connectDb from "@/models/connectDb";
import {VendorModel} from "@/models/vendor";
import {NextApiRequest, NextApiResponse} from "next";

connectDb();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === "GET") {
      const vendors = await VendorModel.find({}).sort({PartyName: 1});
      res.status(200).json(vendors);
    } else if (req.method === "POST") {
      if (req.headers["x-bulk-operation"] === "true") {
        await handleBulkInsert(req, res);
      } else {
        await handleSingleInsert(req, res);
      }
    } else {
      res.status(405).json({message: "Method not allowed"});
    }
  } catch (error: any) {
    console.error(error);
    if (error.name === "ValidationError") {
      res.status(400).json({message: error.message});
    } else {
      res.status(500).json({message: "Internal server error"});
    }
  }
}

async function handleSingleInsert(req: NextApiRequest, res: NextApiResponse) {
  const {PartyName, GSTNo, Add1, Add2, Add3, CGST, SGST, IGST} = req.body;

  const newVendor = new VendorModel({
    PartyName,
    GSTNo,
    Add1,
    Add2,
    Add3,
    CGST,
    SGST,
    IGST,
  });

  await newVendor.save();
  res.status(201).json({message: "Vendor created successfully"});
}

async function handleBulkInsert(req: NextApiRequest, res: NextApiResponse) {
  const vendors = req.body;

  if (!Array.isArray(vendors)) {
    return res
      .status(400)
      .json({message: "Data should be an array of vendors"});
  }

  try {
    await VendorModel.insertMany(vendors);
    res.status(201).json({message: "Vendors created successfully"});
  } catch (error) {
    console.error(error);
    res.status(500).json({message: "Internal server error during bulk insert"});
  }
}
