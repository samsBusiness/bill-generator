import {NextApiRequest, NextApiResponse} from "next";
import connectDb from "@/models/connectDb";
import {CounterModel} from "@/models/counter";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {method} = req;

  await connectDb();

  switch (method) {
    case "GET":
      try {
        const counter = await CounterModel.findOne({_id: "Invoice._id"});
        res.status(200).json({success: true, data: counter.seq});
      } catch (error) {
        res.status(400).json({success: false});
      }
      break;
    case "POST":
      try {
        // const invoice = await Invoice.create(req.body);
        // res.status(201).json({success: true, data: invoice});
        const counter = await CounterModel.findOneAndUpdate(
          {_id: "Invoice._id"},
          {$set: {seq: req.body.value}},
          {new: true, upsert: true} // Create document if it doesn't exist
        );
        res.status(201).json({success: true, data: counter});
      } catch (error: any) {
        console.error(error.message);
        if (error.name === "ValidationError") {
          res.status(400).json({message: error.message});
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
