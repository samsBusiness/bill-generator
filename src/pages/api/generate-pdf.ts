import type {NextApiRequest, NextApiResponse} from "next";
import puppeteer from "puppeteer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {data} = req.body;

  if (!data) {
    return res.status(400).json({message: "Missing data"});
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const pdfData = JSON.stringify(data);
  const url = `http://localhost:3000/billpdf?data=${encodeURIComponent(pdfData)}`;

  await page.goto(url, {waitUntil: "networkidle0"});

  const pdfBuffer = await page.pdf({format: "A4"});

  await browser.close();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", "attachment; filename=bill.pdf");
  res.send(pdfBuffer);
}
