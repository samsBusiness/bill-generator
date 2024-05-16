import React, {useEffect, useState} from "react";
import {BForm, Product} from "./billForm";
import Dateformat from "dateformat";
import {price_in_words} from "@/lib/utils";
interface props {
  form: BForm;
}
const FormattedBill: React.FC<props> = ({form}) => {
  const [products, setProducts] = useState<Product[]>(
    Array(13).fill({
      sr: "",
      part: "",
      HSN: "",
      QTY: "",
      type: "",
      rate: "",
      amt: "",
      amtF: "",
    })
  );
  useEffect(() => {
    console.log("HERE");
    form.prods.forEach((prod: Product, idx) => {
      products[idx] = {...prod};
    });
    setProducts([...products]);
  }, []);

  return (
    <>
      <div
        className=" flex flex-col items-center w-full py-4  px-4 "
        style={{
          fontFamily: "'calibri',sans-serif",
          margin: "0 auto",
          height: "297mm",
          width: "210mm",
        }}
      >
        <div
          className=" border-black border-[2px] w-full  text-center flex flex-col items-center p-4"
          id="doc"
        >
          <p className="text-[20px] font-bold"> Tax Invoice</p>
          <p className="text-[44px] font-bold">S. KasamAli Bros.</p>
          <p className="text-[11px] font-bold">
            Specialist in : Taps & Dies. Dealers in : HSS & Carbide Drills, Hob
            Cutters, HSS Punches & General Hardware
          </p>
          <p className="text-[11px] w-2/3">
            178, Mutton Street, Opp. Null Bazar, Mumbai – 400 003. Email
            :skb178ms@gmail.com Mob.:9833911071 / Tel.: 23460059
          </p>
        </div>
        <div className=" w-full mt-2">
          <table className="fullborder border-collapse border-[1px] border-black w-full font-bold text-[12px] tracking-wide table-fixed">
            <tbody>
              <tr>
                <th className="tracking-wider">M/s</th>
                <th colSpan={4} className="text-left px-2">
                  {form.pname}
                </th>
                <th>INV. NO.</th>
                <th>{form.invNo}</th>
                <th>Date</th>
                <th>{form.IDate ? Dateformat(form.IDate, "dd-mm-yy") : ""}</th>
              </tr>
              <tr>
                <th rowSpan={2}>ADDRESS</th>
                <th rowSpan={2} colSpan={4} className="text-left px-2">
                  <p>{form.add1}</p>
                  <p>{form.add2}</p>
                  <p>{form.add3}</p>
                </th>
                <th className="px-2 text-[11px]">CHALAN NO</th>
                <th>{form.ChNo}</th>
                <th>Date</th>
                <th>{form.CDate ? Dateformat(form.CDate, "dd-mm-yy") : ""}</th>
              </tr>
              <tr>
                <th className="py-2">P.O. NO.</th>
                <th>{form.PONo}</th>
                <th>Date</th>
                <th>{form.Pdate ? Dateformat(form.Pdate, "dd-mm-yy") : ""}</th>
              </tr>
              <tr>
                <th>GSTN:</th>
                <th colSpan={4} className="text-left px-2">
                  {form.GSTN}
                </th>
                <th className="py-2">EWAY</th>
                <th colSpan={3}>{form.Eway}</th>
              </tr>
            </tbody>
          </table>

          {/* **************************************************************************************************************************************************** */}
          <table className="first-border mt-2 border-collapse border-[1px] border-black w-full text-[12px] tracking-wide table-fixed">
            <tbody>
              <tr className="border-[1px] border-black">
                <th className="text-[10px]">Sr No</th>
                <th className="text-[14px]" colSpan={3}>
                  Particulars
                </th>
                <th className="text-[14px]">HSN</th>
                <th className="text-[14px]">Qty</th>
                <th className="text-[12px]">Rate</th>
                <th className="text-[14px]" colSpan={2}>
                  Amount Rs.
                </th>
              </tr>
              {products.map((product, idx) => (
                <tr key={"tr" + idx}>
                  <td className="text-[10px] px-2 py-1">
                    {product.sr ? idx + 1 : ""}
                  </td>
                  <td className="text-[11px] px-2 py-1" colSpan={3}>
                    {product.part}
                  </td>
                  <td className="text-[10px] px-2 py-1 text-center">
                    {product.HSN}
                  </td>
                  <td className="text-[11px] px-2 py-1 text-center">
                    {product.QTY + product.type}
                  </td>
                  <td className="text-[11px] px-2 py-1 text-right">
                    {product.rate}
                  </td>
                  <td className="text-[11px] px-2 py-1 text-right" colSpan={2}>
                    {product.amtF}
                  </td>
                </tr>
              ))}

              {/* DISCOUNT */}
              <tr>
                <td className="text-[10px] px-2 py-1"></td>
                <td colSpan={3}></td>
                <td
                  className="text-[12px] px-2 py-1 text-right font-bold border-t-[1px] border-black"
                  colSpan={2}
                >
                  Discount%
                </td>
                <td className="text-[11px] px-2 py-1 text-right border-t-[1px] border-black"></td>
                <td
                  className="text-[11px] px-2 py-1 text-right border-t-[1px] border-black"
                  colSpan={2}
                >
                  {form.discount}
                </td>
              </tr>
            </tbody>
          </table>
          {/* ******************************************************************************************************** */}
          <table className="fullborder mt-2 border-collapse border-[1px] border-black w-full text-[12px] tracking-wide table-fixed">
            <tbody>
              <tr>
                <th colSpan={5} rowSpan={2}>
                  GSTIN.No. 27ALKPM0702G1ZD
                </th>
                <th colSpan={2}>Packing & Forwarding</th>
                <th colSpan={2} className="text-right px-2">
                  {form.pnf}
                </th>
              </tr>
              <tr>
                <th colSpan={2}>Total</th>
                <th colSpan={2} className="text-right px-2">
                  {form.lessdisc}
                </th>
              </tr>
              {/*  */}
              <tr>
                <td colSpan={5} rowSpan={2} className="px-2">
                  {price_in_words(form.Gtotal)}
                </td>
                <th colSpan={2}>CGST 9%</th>
                <th colSpan={2} className="text-right px-2">
                  {form.CGST || ""}
                </th>
              </tr>
              <tr>
                <th colSpan={2}>SGST 9%</th>
                <th colSpan={2} className="text-right px-2">
                  {form.SGST || ""}
                </th>
              </tr>
              {/*  */}
              <tr>
                <th
                  colSpan={5}
                  rowSpan={2}
                  className="px-2 text-left tracking-normal text-[10px]"
                >
                  <p>Bank Details : S KASAMALI BROS</p>
                  <p>Bank : HDFC BANK</p>
                  <p>A/c No .: 59212786515253</p>
                  <p>Branch : Null Bazar Branch</p>
                  <p>IFSC Code .: HDFC0000626</p>
                </th>
                <th colSpan={2}>IGST 18%</th>
                <th colSpan={2} className="text-right px-2">
                  {form.IGST || ""}
                </th>
              </tr>
              <tr>
                <th colSpan={2} className="underline py-4">
                  GRAND TOTAL
                </th>
                <th colSpan={2} className="text-right px-2">
                  {form.Gtotal}
                </th>
              </tr>
              <tr>
                <td colSpan={5} className="text-left px-2">
                  <p>SUBJECT TO MUMBAI JURISDICTION</p>
                  <p>
                    • No claim will be entertained after 24 hours of delivery.
                  </p>
                  <p>• Goods once sold will not be taken back.</p>
                </td>
                <td colSpan={4} className="text-center ">
                  <p>For. S. KASAMALI BROS.</p>
                  <img src="" className="w-20 h-20 mx-auto" alt="" />
                  <p>Proprieter</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default FormattedBill;
