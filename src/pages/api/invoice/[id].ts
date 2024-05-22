import connectDb from "@/models/connectDb";
import {Invoice} from "@/models/invoice";
import {NextApiRequest, NextApiResponse} from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {method} = req;
  const {id} = req.query;

  await connectDb();

  switch (method) {
    case "GET":
      try {
        const invoice = await Invoice.findById(id);
        if (!invoice) {
          return res.status(404).json({success: false});
        }
        res.status(200).json({success: true, data: invoice});
      } catch (error) {
        res.status(400).json({success: false});
      }
      break;
    case "PUT":
      try {
        const invoice = await Invoice.findByIdAndUpdate(id, req.body, {
          new: true,
          runValidators: true,
        });
        if (!invoice) {
          return res.status(404).json({success: false});
        }
        res.status(200).json({success: true, data: invoice});
      } catch (error) {
        res.status(400).json({success: false});
      }
      break;
    case "DELETE":
      try {
        const deletedInvoice = await Invoice.deleteOne({_id: id});
        if (!deletedInvoice) {
          return res.status(404).json({success: false});
        }
        res.status(200).json({success: true, data: {}});
      } catch (error) {
        res.status(400).json({success: false});
      }
      break;
    default:
      res.status(400).json({success: false});
      break;
  }
}
