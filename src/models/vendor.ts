import mongoose, {Document, Schema} from "mongoose";

// Define interface for Vendor document
export interface VendorDocument extends Document {
  PartyName: string;
  GSTNo: string;
  Add1: string;
  Add2: string;
  Add3: string;
  CGST: boolean;
  SGST: boolean;
  IGST: boolean;
}

// Define schema for Vendor
const vendorSchema = new Schema<VendorDocument>({
  PartyName: {type: String, required: true},
  GSTNo: {type: String, required: true},
  Add1: {type: String},
  Add2: {type: String},
  Add3: {type: String},
  CGST: {type: Boolean, default: false},
  SGST: {type: Boolean, default: false},
  IGST: {type: Boolean, default: false},
});

// Create and export Vendor model
export const VendorModel =
  mongoose.models.Vendor || mongoose.model("Vendor", vendorSchema);
