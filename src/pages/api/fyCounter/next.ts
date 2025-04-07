import connectDb from "@/models/connectDb";
import {FYCounterModel} from "@/models/fyCounter";
import {NextApiRequest, NextApiResponse} from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({message: "Method not allowed"});
  }

  try {
    await connectDb();
    const {fy} = req.query;

    if (!fy || typeof fy !== "string") {
      return res.status(400).json({message: "Financial year (fy) is required"});
    }

    // Get the current sequence without incrementing
    const counter = await FYCounterModel.findById(fy);
    const nextNumber = (counter?.seq || 0) + 1;

    return res.status(200).json({
      fy,
      nextNumber,
      invNo: `${fy}/${String(nextNumber).padStart(3, "0")}`,
    });
  } catch (error: any) {
    console.error("Error in FY counter API:", error);
    return res.status(500).json({message: error.message});
  }
}
