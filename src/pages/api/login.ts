// pages/api/login.ts
import {NextApiRequest, NextApiResponse} from "next";
import {IUser, User} from "../../models/user";
import connectDb from "@/models/connectDb";
// import  from '../../models/connectDb';
// import bcrypt from 'bcryptjs';

connectDb();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const {username, password} = req.body;
    try {
      // Find user by username
      const user: IUser | null = await User.findOne({username});

      if (!user) {
        return res.status(401).json({message: "Invalid username or password"});
      }

      // Check password
      const isMatch: boolean = password == user.password;

      if (!isMatch) {
        return res.status(401).json({message: "Invalid username or password"});
      }

      // Authentication successful
      return res.status(200).json({message: "Login successful"});
    } catch (error) {
      console.error(error);
      res.status(500).json({message: "Internal Server Error"});
    }
  } else {
    res.status(405).json({message: "Method Not Allowed"});
  }
}
