import connectDb from "@/models/connectDb";
import {FYCounterModel} from "@/models/fyCounter";
import {NextApiRequest, NextApiResponse} from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({message: "Method not allowed"});
  }

  try {
    await connectDb();
    const {fy} = req.query;
    const {value} = req.body;

    if (!fy || typeof fy !== "string") {
      return res.status(400).json({message: "Financial year (fy) is required"});
    }

    if (typeof value !== "number") {
      return res.status(400).json({message: "Value must be a number"});
    }

    // Update the counter value
    const counter = await FYCounterModel.findByIdAndUpdate(
      fy,
      {seq: value},
      {new: true}
    );

    if (!counter) {
      return res.status(404).json({message: "Counter not found"});
    }

    return res.status(200).json(counter);
  } catch (error: any) {
    console.error("Error in FY counter API:", error);
    return res.status(500).json({message: error.message});
  }
}
