import type {NextApiRequest, NextApiResponse} from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({message: "Method not allowed"});
  }

  const {data} = req.body || {};
  if (!data) {
    return res.status(400).json({message: "Missing data"});
  }

  try {
    const apiKey = process.env.PDFSHIFT_API_KEY;
    if (!apiKey) {
      return res
        .status(500)
        .json({message: "Missing PDFSHIFT_API_KEY env var"});
    }

    const pdfData = JSON.stringify(data);
    // const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    const baseUrl = "https://bill-generator-self.vercel.app";
    if (!baseUrl) {
      return res
        .status(500)
        .json({message: "Missing NEXT_PUBLIC_BASE_URL env var"});
    }
    const url = `${baseUrl}/billpdf?data=${encodeURIComponent(pdfData)}`;

    const resp = await fetch("https://api.pdfshift.io/v3/convert/pdf", {
      method: "POST",
      headers: {
        "X-API-Key": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: url,
        use_print: true,
        landscape: false,
        format: "A4",
        margin: {top: "0.4in", right: "0.4in", bottom: "0.4in", left: "0.4in"},
      }),
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(500).json({message: "PDFShift error", detail: text});
    }

    const arrayBuffer = await resp.arrayBuffer();
    const pdfBuffer = Buffer.from(arrayBuffer);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=bill.pdf");
    res.send(pdfBuffer);
  } catch (error: any) {
    console.error(error);
    res.status(500).json({error: error.message});
  }
}
