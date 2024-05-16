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
      const vendors = await VendorModel.find({});
      res.status(200).json(vendors);
    } else if (req.method === "POST") {
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
    } else {
      res.status(405).json({message: "Method not allowed"});
    }
  } catch (error) {
    console.error(error);

    if (error === "ValidationError") {
      // Handle validation errors
      res.status(400).json({message: error});
    } else {
      res.status(500).json({message: "Internal server error"});
    }
  }
}
