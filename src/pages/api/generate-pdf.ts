import type {NextApiRequest, NextApiResponse} from "next";
import chromium from "@sparticuz/chromium";
import * as puppeteer from "puppeteer";
import puppeteerCore from "puppeteer-core";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {data} = req.body;

  if (!data) {
    return res.status(400).json({message: "Missing data"});
  }
  let browser = null;
  try {
    // const executablePath = await chromium.executablePath;
    // console.log("Executable path: " + executablePath)
    // browser = await puppeteer.launch({
    //   args: [...chromium.args, '--hide-scrollbars', '--disable-web-security'],
    //   executablePath,
    //   headless: chromium.headless,
    // });
    // browser = await puppeteer.launch({
    //   args: chromium.args,
    //   defaultViewport: chromium.defaultViewport,
    //   executablePath: await chromium.executablePath(),
    //   headless: chromium.headless,
    //   ignoreHTTPSErrors: true,
    // });
    if (process.env.NODE_ENV === "development") {
      browser = await puppeteer.launch({
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
        headless: true,
      });
    }
    if (process.env.NODE_ENV === "production") {
      browser = await puppeteerCore.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
      });
    }
    const page = await browser?.newPage();
    const pdfData = JSON.stringify(data);
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/billpdf?data=${encodeURIComponent(pdfData)}`;
    console.log("Navigating to: " + url);
    await page?.goto(url, {waitUntil: "networkidle0"});

    const pdfBuffer = await page?.pdf({format: "A4"});

    await browser?.close();

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=bill.pdf");
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({error: error.message});
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
}
