import connectDb from "@/models/connectDb";
import {VendorModel} from "@/models/vendor";
import {NextApiRequest, NextApiResponse} from "next";

connectDb();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {id} = req.query; // Get the vendor ID from the URL parameter

  if (req.method === "GET") {
    try {
      // Find the vendor by ID
      const vendor = await VendorModel.findById(id);

      if (!vendor) {
        return res.status(404).json({message: "Vendor not found"});
      }

      // Return the vendor data
      res.status(200).json(vendor);
    } catch (error) {
      console.error(error);

      if (error === "CastError") {
        res.status(400).json({message: "Invalid vendor ID"});
      } else {
        res.status(500).json({message: "Internal server error"});
      }
    }
  } else if (req.method === "PUT") {
    try {
      const {PartyName, GSTNo, Add1, Add2, Add3, CGST, SGST, IGST} = req.body;

      // Update the vendor by ID
      const vendorToUpdate = await VendorModel.findByIdAndUpdate(id, {
        PartyName,
        GSTNo,
        Add1,
        Add2,
        Add3,
        CGST,
        SGST,
        IGST,
      });

      if (!vendorToUpdate) {
        return res.status(404).json({message: "Vendor not found"});
      }

      // Update the vendor and return the updated data
      const updatedVendor = await vendorToUpdate.save();
      res.status(200).json(updatedVendor);
    } catch (error) {
      console.error(error);

      if (error === "CastError") {
        res.status(400).json({message: "Invalid vendor ID"});
      } else {
        res.status(500).json({message: "Internal server error"});
      }
    }
  } else if (req.method === "DELETE") {
    try {
      // Delete the vendor by ID
      const deletedVendor = await VendorModel.findByIdAndDelete(id);

      if (!deletedVendor) {
        return res.status(404).json({message: "Vendor not found"});
      }

      // Return a success message upon deletion
      res.status(200).json({message: "Vendor deleted successfully"});
    } catch (error) {
      console.error(error);

      if (error === "CastError") {
        res.status(400).json({message: "Invalid vendor ID"});
      } else {
        res.status(500).json({message: "Internal server error"});
      }
    }
  } else {
    res.status(405).json({message: "Method not allowed"});
  }
}
