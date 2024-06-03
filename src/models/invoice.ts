import mongoose from "mongoose";
import {CounterModel} from "./counter";
export interface InvoiceDocument extends Document {
  _id: object;
  // sr: number;
  pname: string;
  GSTN: string;
  add1?: string;
  add2?: string;
  add3?: string;
  type?: string;
  no?: string;
  invNo?: string;
  IDate?: Date;
  d?: number;
  m?: number;
  y?: number;
  ChNo?: string;
  CDate?: Date;
  PONo?: string;
  Pdate?: Date;
  Eway?: string;

  sr1?: number;
  part1?: string;
  HSN1?: number;
  QTY1?: number;
  typ1?: string;
  rate1?: number;
  amt1?: number;
  amtF1?: string;

  sr2?: number;
  part2?: string;
  HSN2?: number;
  QTY2?: number;
  typ2?: string;
  rate2?: number;
  amt2?: number;
  amtF2?: string;

  sr3?: number;
  part3?: string;
  HSN3?: number;
  QTY3?: number;
  typ3?: string;
  rate3?: number;
  amt3?: number;
  amtF3?: string;

  sr4?: number;
  part4?: string;
  HSN4?: number;
  QTY4?: number;
  typ4?: string;
  rate4?: number;
  amt4?: number;
  amtF4?: string;

  sr5?: number;
  part5?: string;
  HSN5?: number;
  QTY5?: number;
  typ5?: string;
  rate5?: number;
  amt5?: number;
  amtF5?: string;

  sr6?: number;
  part6?: string;
  HSN6?: number;
  QTY6?: number;
  typ6?: string;
  rate6?: number;
  amt6?: number;
  amtF6?: string;

  sr7?: number;
  part7?: string;
  HSN7?: number;
  QTY7?: number;
  typ7?: string;
  rate7?: number;
  amt7?: number;
  amtF7?: string;

  sr8?: number;
  part8?: string;
  HSN8?: number;
  QTY8?: number;
  typ8?: string;
  rate8?: number;
  amt8?: number;
  amtF8?: string;

  sr9?: number;
  part9?: string;
  HSN9?: number;
  QTY9?: number;
  typ9?: string;
  rate9?: number;
  amt9?: number;
  amtF9?: string;

  sr10?: number;
  part10?: string;
  HSN10?: number;
  QTY10?: number;
  typ10?: string;
  rate10?: number;
  amt10?: number;
  amtF10?: string;

  sr11?: number;
  part11?: string;
  HSN11?: number;
  QTY11?: number;
  typ11?: string;
  rate11?: number;
  amt11?: number;
  amtF11?: string;

  sr12?: number;
  part12?: string;
  HSN12?: number;
  QTY12?: number;
  typ12?: string;
  rate12?: number;
  amt12?: number;
  amtF12?: string;

  sr13?: number;
  part13?: string;
  HSN13?: number;
  QTY13?: number;
  typ13?: string;
  rate13?: number;
  amt13?: number;
  amtF13?: string;

  discount?: number;
  discamt: number;
  pnf?: number;
  total?: number;
  lessdisc?: number;
  CGST?: number;
  SGST?: number;
  IGST?: number;
  Gtotal: number;
  GtotalText: string;
}

const invoiceSchema = new mongoose.Schema({
  _id: {type: Number},
  pname: {type: String, required: true},
  GSTN: {type: String, required: true},
  add1: {type: String},
  add2: {type: String},
  add3: {type: String},
  type: {type: String},
  no: {type: Number, required: true, unique: true},
  invNo: {type: String, required: true, unique: true},
  IDate: {type: Date},
  d: {type: Number},
  m: {type: Number},
  y: {type: Number},
  ChNo: {type: String},
  CDate: {type: Date},
  PONo: {type: String},
  Pdate: {type: Date},
  Eway: {type: String},

  sr1: {type: Number},
  part1: {type: String},
  HSN1: {type: Number},
  QTY1: {type: Number},
  typ1: {type: String},
  rate1: {type: Number},
  amt1: {type: Number},
  amtF1: {type: String},

  sr2: {type: Number},
  part2: {type: String},
  HSN2: {type: Number},
  QTY2: {type: Number},
  typ2: {type: String},
  rate2: {type: Number},
  amt2: {type: Number},
  amtF2: {type: String},

  sr3: {type: Number},
  part3: {type: String},
  HSN3: {type: Number},
  QTY3: {type: Number},
  typ3: {type: String},
  rate3: {type: Number},
  amt3: {type: Number},
  amtF3: {type: String},

  sr4: {type: Number},
  part4: {type: String},
  HSN4: {type: Number},
  QTY4: {type: Number},
  typ4: {type: String},
  rate4: {type: Number},
  amt4: {type: Number},
  amtF4: {type: String},

  sr5: {type: Number},
  part5: {type: String},
  HSN5: {type: Number},
  QTY5: {type: Number},
  typ5: {type: String},
  rate5: {type: Number},
  amt5: {type: Number},
  amtF5: {type: String},

  sr6: {type: Number},
  part6: {type: String},
  HSN6: {type: Number},
  QTY6: {type: Number},
  typ6: {type: String},
  rate6: {type: Number},
  amt6: {type: Number},
  amtF6: {type: String},

  sr7: {type: Number},
  part7: {type: String},
  HSN7: {type: Number},
  QTY7: {type: Number},
  typ7: {type: String},
  rate7: {type: Number},
  amt7: {type: Number},
  amtF7: {type: String},

  sr8: {type: Number},
  part8: {type: String},
  HSN8: {type: Number},
  QTY8: {type: Number},
  typ8: {type: String},
  rate8: {type: Number},
  amt8: {type: Number},
  amtF8: {type: String},

  sr9: {type: Number},
  part9: {type: String},
  HSN9: {type: Number},
  QTY9: {type: Number},
  typ9: {type: String},
  rate9: {type: Number},
  amt9: {type: Number},
  amtF9: {type: String},

  sr10: {type: Number},
  part10: {type: String},
  HSN10: {type: Number},
  QTY10: {type: Number},
  typ10: {type: String},
  rate10: {type: Number},
  amt10: {type: Number},
  amtF10: {type: String},

  sr11: {type: Number},
  part11: {type: String},
  HSN11: {type: Number},
  QTY11: {type: Number},
  typ11: {type: String},
  rate11: {type: Number},
  amt11: {type: Number},
  amtF11: {type: String},

  sr12: {type: Number},
  part12: {type: String},
  HSN12: {type: Number},
  QTY12: {type: Number},
  typ12: {type: String},
  rate12: {type: Number},
  amt12: {type: Number},
  amtF12: {type: String},

  sr13: {type: Number},
  part13: {type: String},
  HSN13: {type: Number},
  QTY13: {type: Number},
  typ13: {type: String},
  rate13: {type: Number},
  amt13: {type: Number},
  amtF13: {type: String},

  discount: {type: Number},
  discamt: {type: Number, default: 0},
  pnf: {type: Number, required: true, default: 0},
  total: {type: Number, required: true, default: 0},
  lessdisc: {type: Number, required: true, default: 0},
  CGST: {type: Number, required: true, default: 0},
  SGST: {type: Number, required: true, default: 0},
  IGST: {type: Number, required: true, default: 0},
  Gtotal: {type: Number, required: true, default: 0},
  GtotalText: {type: String, required: true, default: "Rupees Zero only"},
});

invoiceSchema.pre("save", async function (next) {
  if (this.isNew) {
    const counter = await CounterModel.findByIdAndUpdate(
      {_id: "Invoice._id"},
      {$inc: {seq: 1}},
      {new: true, upsert: true}
    );
    this._id = counter.seq;
  }
  next();
});

export const Invoice =
  mongoose.models.Invoice || mongoose.model("Invoice", invoiceSchema);
