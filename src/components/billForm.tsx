import React, {useEffect, useState} from "react";
// import {
//   SelectValue,
//   SelectTrigger,
//   SelectItem,
//   SelectContent,
//   Select,
// } from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {PopoverTrigger, PopoverContent, Popover} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {Button} from "@/components/ui/button";
import axios, {AxiosError} from "axios";
import {VendorDocument} from "@/models/vendor";
import Dateformat from "dateformat";
import FormattedBill from "./formattedBill";
import {Combobox} from "./combobox";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTrash} from "@fortawesome/free-solid-svg-icons";
import {InvoiceDocument} from "@/models/invoice";
import {
  flattenObjectWithoutDelimiter,
  getFinYear,
  price_in_words,
  roundto2decimal,
} from "@/lib/utils";

// import html2canvas from "html2canvas";
// import {jsPDF} from "jspdf";
export interface Product {
  id: string;
  sr: number;
  part: string;
  HSN: number;
  QTY: number;
  type: string;
  rate: number;
  amt: number;
  amtF: string;
}
export interface BForm {
  invoiceTitle?: string;
  pname: string;
  GSTN: string;
  add1?: string;
  add2?: string;
  add3?: string;
  type: string;
  no?: string;
  invNo?: string;
  IDate?: Date;
  ChNo?: string;
  CDate?: Date;
  PONo?: string;
  Pdate?: Date;
  Eway?: string;
  prods: Product[];

  discount?: number;
  discamt?: number;
  pnf?: number;
  total: number;
  lessdisc?: number;
  CGST?: number;
  SGST?: number;
  IGST?: number;
  Gtotal: number;
  GtotalText?: string;
}

const initialValues: BForm = {
  pname: "",
  GSTN: "",
  prods: [],
  type: "Invoice",
  total: 0,
  Gtotal: 0,
  GtotalText: "Zero only",
};

const newProd = (srno: number) => ({
  id: "prod_" + srno,
  sr: srno,
  part: "",
  HSN: 8207,
  QTY: 0,
  type: "Kgs",
  rate: 0,
  amt: 0,
  amtF: "",
});

const BillForm: React.FC<any> = ({editForm = undefined, callback = null}) => {
  const [form, setForm] = useState<BForm>(editForm?.form || initialValues);
  // const types = ["Invoice", "Challan"];
  const [vendors, setVendors] = useState(editForm?.vendors || []);
  const [vendor, setVendor] = useState<VendorDocument>(editForm?.vendor);
  const [prods, setProds] = useState<Product[]>(editForm?.products || []);
  const [preview, setPreview] = useState(false);
  const [IdatepopoverOpen, setIdatepopoverOpen] = useState(false);
  const [CdatepopoverOpen, setCdatepopoverOpen] = useState(false);
  const [PdatepopoverOpen, setPdatepopoverOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const ProductunitTypes = ["Kgs", "Pcs", "Sets"];
  useEffect(() => {
    setLoading(true);
    console.log("USEFFECT first");
    form.invoiceTitle = "Tax Invoice";
    axios
      .get("/api/vendors")
      .then((response) => {
        setVendors(response.data);
      })
      .finally(() => {
        setLoading(false);
      });
    if (!form.invNo) {
      setLoading(true);
      axios
        .get("/api/invoice/counter")
        .then((response) => {
          // setForm({...form, no: response.data.data});
          // console.log(response.data.data);
          form.no = response.data.data + 1;
          calculateAllFields();
        })
        .finally(() => {
          // setLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    calculateAllFields();
    setLoading(false);
  }, [editForm]);

  useEffect(() => {
    setForm({
      ...form,
      pname: vendor?.PartyName || "",
      GSTN: vendor?.GSTNo || "",
      add1: vendor?.Add1 || "",
      add2: vendor?.Add2 || "",
      add3: vendor?.Add3 || "",
      SGST: vendor?.SGST ? 0 : undefined,
      CGST: vendor?.CGST ? 0 : undefined,
      IGST: vendor?.IGST ? 0 : undefined,
    });
  }, [vendor]);

  useEffect(() => {
    setForm({...form, prods: [...prods]});
  }, [prods]);

  const handleSubmit = () => {
    setPreview(true);
  };

  const calculateAllFields = () => {
    console.log("CHANGED");
    prods.forEach((prod) => {
      prod.amt = prod.rate * prod.QTY;
      prod.amtF = prod.amt == 0 ? "" : prod.amt.toString();
    });
    setProds([...prods]);
    const invNo: string = form.no
      ? getFinYear(form.IDate) + "/" + String(form.no).padStart(3, "0")
      : "";
    const total: number = prods.reduce((acc, prod) => acc + prod.amt, 0);
    const discamt: number = roundto2decimal(
      ((form.discount || 0) * total) / 100
    );
    const lessdisc: number = roundto2decimal(total - discamt + (form.pnf || 0));
    const CGST = vendor?.CGST
      ? roundto2decimal((lessdisc * 9) / 100)
      : undefined;
    const SGST = vendor?.SGST
      ? roundto2decimal((lessdisc * 9) / 100)
      : undefined;
    const IGST = vendor?.IGST
      ? roundto2decimal((lessdisc * 18) / 100)
      : undefined;
    const Gtotal: number = Math.floor(
      lessdisc + (CGST || 0) + (SGST || 0) + (IGST || 0) + 0.5
    );
    const GtotalText = Gtotal == 0 ? form.GtotalText : price_in_words(Gtotal);
    const calculatedFields: Partial<BForm> = {
      total,
      discamt,
      lessdisc,
      CGST,
      SGST,
      IGST,
      Gtotal,
      invNo,
      GtotalText,
    };
    console.log("CALCULATED FIELDS", {...form, ...calculatedFields}, form);
    setForm({...form, ...calculatedFields});
  };

  // const saveDoc = () => {
  //   setLoading(true);
  //   const input = document.getElementById("billdoc");
  //   if (input == null) return;
  //   html2canvas(input, {scale: 1})
  //     .then((canvas) => {
  //       const imgData = canvas.toDataURL("image/png");
  //       // console.log(imgData);
  //       const pdf = new jsPDF("p", "mm", "a4");
  //       const width = pdf.internal.pageSize.getWidth();
  //       const height = pdf.internal.pageSize.getHeight();
  //       pdf.addImage(imgData, "PNG", 0, 0, width, height);
  //       // pdf.output('dataurlnewwindow');
  //       pdf.save(
  //         `${form.invNo} ${form.pname} ${Dateformat(form.IDate, "dd-mm-yyyy")}.pdf`
  //       );
  //     })
  //     .finally(() => setLoading(false));
  // };
  const generateAndDownloadPdf = async () => {
    const data = form; // Your data here

    try {
      const response = await axios.post(
        "/api/generate-pdf",
        {data},
        {responseType: "blob"}
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `${form.invNo} ${form.pname} ${Dateformat(form.IDate, "dd-mm-yyyy")}.pdf`
      );
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      window.URL.revokeObjectURL(url); // Clean up the object URL
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

  const saveInvoice = async () => {
    const parts: any = {
      1: {
        sr1: undefined,
        part1: undefined,
        HSN1: undefined,
        QTY1: undefined,
        typ1: undefined,
        rate1: undefined,
        amt1: undefined,
        amtF1: undefined,
      },
      2: {
        sr2: undefined,
        part2: undefined,
        HSN2: undefined,
        QTY2: undefined,
        typ2: undefined,
        rate2: undefined,
        amt2: undefined,
        amtF2: undefined,
      },

      3: {
        sr3: undefined,
        part3: undefined,
        HSN3: undefined,
        QTY3: undefined,
        typ3: undefined,
        rate3: undefined,
        amt3: undefined,
        amtF3: undefined,
      },

      4: {
        sr4: undefined,
        part4: undefined,
        HSN4: undefined,
        QTY4: undefined,
        typ4: undefined,
        rate4: undefined,
        amt4: undefined,
        amtF4: undefined,
      },
      5: {
        sr5: undefined,
        part5: undefined,
        HSN5: undefined,
        QTY5: undefined,
        typ5: undefined,
        rate5: undefined,
        amt5: undefined,
        amtF5: undefined,
      },
      6: {
        sr6: undefined,
        part6: undefined,
        HSN6: undefined,
        QTY6: undefined,
        typ6: undefined,
        rate6: undefined,
        amt6: undefined,
        amtF6: undefined,
      },
      7: {
        sr7: undefined,
        part7: undefined,
        HSN7: undefined,
        QTY7: undefined,
        typ7: undefined,
        rate7: undefined,
        amt7: undefined,
        amtF7: undefined,
      },
      8: {
        sr8: undefined,
        part8: undefined,
        HSN8: undefined,
        QTY8: undefined,
        typ8: undefined,
        rate8: undefined,
        amt8: undefined,
        amtF8: undefined,
      },
      9: {
        sr9: undefined,
        part9: undefined,
        HSN9: undefined,
        QTY9: undefined,
        typ9: undefined,
        rate9: undefined,
        amt9: undefined,
        amtF9: undefined,
      },
      10: {
        sr10: undefined,
        part10: undefined,
        HSN10: undefined,
        QTY10: undefined,
        typ10: undefined,
        rate10: undefined,
        amt10: undefined,
        amtF10: undefined,
      },
      11: {
        sr11: undefined,
        part11: undefined,
        HSN11: undefined,
        QTY11: undefined,
        typ11: undefined,
        rate11: undefined,
        amt11: undefined,
        amtF11: undefined,
      },
      12: {
        sr12: undefined,
        part12: undefined,
        HSN12: undefined,
        QTY12: undefined,
        typ12: undefined,
        rate12: undefined,
        amt12: undefined,
        amtF12: undefined,
      },
      13: {
        sr13: undefined,
        part13: undefined,
        HSN13: undefined,
        QTY13: undefined,
        typ13: undefined,
        rate13: undefined,
        amt13: undefined,
        amtF13: undefined,
      },
    };
    for (let index = 0; index < form.prods.length; index++) {
      const prod = form.prods[index];
      parts[index + 1] = {
        [`sr${index + 1}`]: index + 1,
        [`part${index + 1}`]: prod.part,
        [`HSN${index + 1}`]: prod.HSN,
        [`QTY${index + 1}`]: prod.QTY,
        [`typ${index + 1}`]: prod.type,
        [`rate${index + 1}`]: prod.rate,
        [`amt${index + 1}`]: prod.amt,
        [`amtf${index + 1}`]: prod.amtF,
      };
    }
    const invoice: Partial<InvoiceDocument> = {
      pname: form.pname,
      GSTN: form.GSTN,
      add1: form.add1,
      add2: form.add2,
      add3: form.add3,
      type: form.type,
      no: form.no,
      invNo: form.invNo,
      IDate: form.IDate,
      d: form.IDate?.getDate(),
      m: form.IDate ? form.IDate.getMonth() + 1 : undefined,
      y: form.IDate?.getFullYear(),
      ChNo: form.ChNo,
      CDate: form.CDate,
      PONo: form.PONo,
      Pdate: form.Pdate,
      Eway: form.Eway,

      ...flattenObjectWithoutDelimiter(parts),

      discount: form.discount,
      discamt: form.discamt || 0,
      pnf: form.pnf,
      total: form.total,
      lessdisc: form.lessdisc,
      CGST: form.CGST,
      SGST: form.SGST,
      IGST: form.IGST,
      Gtotal: form.Gtotal,
      GtotalText: form.GtotalText ? "Rupees " + form.GtotalText : null,
    };

    try {
      if (editForm) {
        const result = await axios.put("/api/invoice/" + editForm.id, invoice);
        if (result.status === 200) {
          alert("Invoice has been updated successfully");
          console.log("Updated invoice");
          callback();
        } else {
          alert(result.data.message);
        }
      } else {
        const result = await axios.post("/api/invoice", invoice);
        console.log(result);
        if (result.status === 201) {
          console.log("Added invoice");
          alert("Invoice has been added successfully");
          callback();
        }
      }
    } catch (error: any) {
      if (error instanceof AxiosError) {
        alert(error.response?.data.message);
        console.log(error.response?.data.message);
      }
      // alert(error.message);
    }
  };

  return loading ? (
    <>
      <span>Exporting to PDF : </span>
      <div className="spinner"></div>
    </>
  ) : preview ? (
    <>
      <div className="flex justify-end">
        <Button className="bg-gray-400" onClick={generateAndDownloadPdf}>
          Download PDF
        </Button>
        <Button className="mx-5 bg-green-700 text-white " onClick={saveInvoice}>
          Accept
        </Button>
        <Button
          className="bg-red-500 text-white"
          onClick={() => setPreview(false)}
        >
          Go Back to form
        </Button>
      </div>
      <div>
        <FormattedBill form={form} />
      </div>
    </>
  ) : (
    <div className=" mx-auto px-16 mt-8 relative">
      <div className="flex justify-between sticky top-5">
        <h2 className="text-2xl font-bold mb-4">Invoice Form</h2>
        <Button
          onClick={handleSubmit}
          className="bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-950 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus:ring-gray-300"
          type="submit"
        >
          Preview Bill
        </Button>
      </div>
      <form className="space-y-4 ">
        <div>
          <label className="block font-medium mb-1" htmlFor="invoiceTitle">
            Invoice Title
          </label>
          <Input
            id="invoiceTitle"
            defaultValue={form.invoiceTitle}
            onChange={(event) =>
              setForm({...form, invoiceTitle: event.target.value})
            }
            placeholder="Enter Invoice Title"
            type="text"
          />
        </div>
        <div className="w-full">
          <label className="block font-medium mb-1" htmlFor="pname">
            Party Name
          </label>
          <div className="flex">
            {vendors.length > 0 && (
              <Combobox
                id="pname"
                className="w-full"
                items={vendors.map((v: VendorDocument) => ({
                  label: `${v.PartyName} (${v.GSTNo})`,
                  value: JSON.stringify(v),
                }))}
                initValue={JSON.stringify(vendor)}
                onChange={(value: any) => {
                  if (value) setVendor(JSON.parse(value));
                }}
                placeholderText={"Select Party"}
              />
            )}
          </div>

          {/* <Select
            onValueChange={(value) => {
              console.log(value, "CHANGE");
              setVendor(JSON.parse(value));
            }}
            required
            name="Pname"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select product name" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor: VendorDocument, idx) => (
                <SelectItem key={idx} value={JSON.stringify(vendor)}>
                  {vendor.PartyName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="gst">
            GST
          </label>
          <Input
            id="gst"
            defaultValue={form.GSTN}
            onChange={(event) => setForm({...form, GSTN: event.target.value})}
            placeholder="Enter GST"
            type="text"
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="add1">
            ADD1
          </label>
          <Input
            id="add1"
            defaultValue={form.add1}
            onChange={(event) => setForm({...form, add1: event.target.value})}
            placeholder="Enter ADD1"
            type="text"
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="add2">
            ADD2
          </label>
          <Input
            id="add2"
            defaultValue={form.add2}
            onChange={(event) => setForm({...form, add2: event.target.value})}
            placeholder="Enter ADD2"
            type="text"
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="add3">
            ADD3
          </label>
          <Input
            id="add3"
            defaultValue={form.add3}
            onChange={(event) => setForm({...form, add3: event.target.value})}
            placeholder="Enter ADD3"
            type="text"
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="type">
            Type
          </label>
          {/* <Select
            onValueChange={(value) => setForm({...form, type: value})}
            value={form.type}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Invoice">Invoice</SelectItem>
              <SelectItem value="Proforma">Proforma</SelectItem>
            </SelectContent>
          </Select> */}
          <Input readOnly value={form.type}></Input>
        </div>
        {/* INVOICE *************************************************************/}
        {
          <>
            <div className="hidden">
              <label className="block font-medium mb-1" htmlFor="no">
                No
              </label>
              <Input
                id="num"
                defaultValue={form.no}
                value={form.no}
                onChange={(event) => {
                  form.no = event.target.value;
                  calculateAllFields();
                }}
                placeholder="Enter Number"
                type="number"
              />
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="date">
                Invoice Date{" "}
                <span
                  className="bg-red-400 text-white px-1 rounded-full"
                  onClick={(e) => {
                    form.IDate = undefined;
                    calculateAllFields();
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  X
                </span>
              </label>
              <Popover
                open={IdatepopoverOpen}
                onOpenChange={setIdatepopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Input
                    id="date"
                    placeholder="Select date"
                    readOnly
                    type="text"
                    value={
                      form.IDate ? Dateformat(form.IDate, "dd-mm-yyyy") : ""
                    }
                  />
                </PopoverTrigger>
                <PopoverContent className="p-4">
                  <Calendar
                    // defaultMonth={new Date()}
                    onDayClick={(day: Date) => {
                      // setForm({...form, IDate: day});
                      form.IDate = day;
                      calculateAllFields();
                      setIdatepopoverOpen(false); //
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="gst">
                Invoice No
              </label>
              <Input
                id="invno"
                value={form.invNo}
                onChange={(event) =>
                  setForm({...form, invNo: event.target.value})
                }
                placeholder="Enter Invoice Number"
                type="text"
              />
            </div>
          </>
        }
        {/* CHALAN *************************************************************/}
        {
          <>
            <div>
              <label className="block font-medium mb-1" htmlFor="gst">
                Chalan No
              </label>
              <Input
                id="chno"
                defaultValue={form.ChNo}
                onChange={(event) =>
                  setForm({...form, ChNo: event.target.value})
                }
                placeholder="Enter Chalan Number"
                type="text"
              />
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="chdate">
                Chalan Date{" "}
                <span
                  className="bg-red-400 text-white px-1 rounded-full"
                  onClick={(e) => {
                    setForm({...form, CDate: undefined});
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  X
                </span>
              </label>
              <Popover
                open={CdatepopoverOpen}
                onOpenChange={setCdatepopoverOpen}
              >
                <PopoverTrigger asChild>
                  <Input
                    id="date"
                    placeholder="Select date"
                    readOnly
                    type="text"
                    value={
                      form.CDate ? Dateformat(form.CDate, "dd-mm-yyyy") : ""
                    }
                  />
                </PopoverTrigger>
                <PopoverContent className="p-4">
                  <Calendar
                    defaultMonth={new Date()}
                    onDayClick={(day: Date) => {
                      setForm({...form, CDate: day});
                      setCdatepopoverOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </>
        }
        {/* PO ************************************************************ */}
        <div>
          <label className="block font-medium mb-1" htmlFor="gst">
            PO No
          </label>
          <Input
            id="pono"
            defaultValue={form.PONo}
            onChange={(event) => setForm({...form, PONo: event.target.value})}
            placeholder="Enter PO Number"
            type="text"
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="chdate">
            PO Date{" "}
            <span
              className="bg-red-400 text-white px-1 rounded-full"
              onClick={(e) => {
                setForm({...form, Pdate: undefined});
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              X
            </span>
          </label>
          <Popover open={PdatepopoverOpen} onOpenChange={setPdatepopoverOpen}>
            <PopoverTrigger asChild>
              <Input
                id="podate"
                placeholder="Select date"
                readOnly
                type="text"
                value={form.Pdate ? Dateformat(form.Pdate, "dd-mm-yyyy") : ""}
              />
            </PopoverTrigger>
            <PopoverContent className="p-4">
              <Calendar
                defaultMonth={new Date()}
                onDayClick={(day: Date) => {
                  setForm({...form, Pdate: day});
                  setPdatepopoverOpen(false);
                }}
              />
            </PopoverContent>
          </Popover>
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="eway">
            Eway
          </label>
          <Input
            id="eway"
            placeholder="Enter Eway"
            value={form.Eway}
            onChange={(event) => setForm({...form, Eway: event.target.value})}
            type="text"
          />
        </div>

        {/* PRODUCTS *******************************************************************/}
        <div className="text-center">PRODUCTS</div>
        <hr />
        {prods.map((prod, idx) => (
          <div
            key={"prod" + idx}
            className="border-[1px] border-gray-400 border-dashed p-4"
          >
            <div className="w-full flex  items-center">
              <h1>PRODUCT {idx + 1}</h1>
              <FontAwesomeIcon
                icon={faTrash}
                className={
                  prods.length <= 1
                    ? "text-red-200 ml-4"
                    : "cursor-pointer text-red-500 hover:text-red-700 ml-4"
                }
                onClick={
                  prods.length <= 1
                    ? undefined
                    : () => setProds(prods.filter((p) => p.id != prod.id))
                }
              />
              {/* <Button
                className=" text-sm  bg-red-500"
                disabled={prods.length <= 1}
                onClick={() =>
                  setProds(prods.filter((prod) => prod.sr != idx + 1))
                }
              >
                Delete
              </Button> */}
            </div>
            <div
              // key={"prod-" + idx}
              className="grid md:grid-cols-7 sm:grid-cols-3"
            >
              <div className="">
                <label
                  className="block font-medium mb-1"
                  htmlFor={`part-${prod.sr}`}
                >
                  Part
                </label>
                <Input
                  onChange={(element) => {
                    prod.part = element.target.value;
                    setProds([...prods]);
                  }}
                  id={`part-${prod.sr}`}
                  value={prod.part}
                  placeholder="Enter Part"
                  type="text"
                />
              </div>
              <div className="my-1 sm:my-0 sm:mx-3">
                <label
                  className="block font-medium mb-1"
                  htmlFor={`hsn-${prod.sr}`}
                >
                  HSN
                </label>
                <Input
                  onChange={(element) => {
                    prod.HSN = +element.target.value;
                    setProds([...prods]);
                  }}
                  id={`hsn-${prod.sr}`}
                  value={prod.HSN}
                  placeholder="Enter HSN"
                  type="text"
                />
              </div>
              <div className="my-1 sm:my-0 sm:mx-3">
                <label
                  className="block font-medium mb-1"
                  htmlFor={`qty-${prod.sr}`}
                >
                  QTY
                </label>
                <Input
                  className="text-right my-1 sm:my-0 sm:mx-1"
                  size={24}
                  onChange={(element) => {
                    prod.QTY = +element.target.value;
                    calculateAllFields();
                  }}
                  id={`qty-${prod.sr}`}
                  value={prod.QTY == 0 ? undefined : prod.QTY}
                  placeholder="Enter qty"
                  type="number"
                />
              </div>
              <div className="my-1 sm:my-0 sm:mx-1">
                <label
                  className="block font-medium mb-1"
                  htmlFor={`type-${prod.sr}`}
                >
                  Type
                </label>
                {/* <Select
                  defaultValue={prod.type}
                  onValueChange={(value) => (prod.type = value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Kgs">Kgs</SelectItem>
                    <SelectItem value="Pcs">Pcs</SelectItem>
                  </SelectContent>
                </Select> */}
                <Combobox
                  id={`type-${prod.sr}`}
                  // className="w-full"
                  items={ProductunitTypes.map((option: any) => ({
                    label: option,
                    value: option,
                  }))}
                  initValue={ProductunitTypes[0]}
                  onChange={(value: any) => {
                    prod.type = value;
                    setProds([...prods]);
                  }}
                  placeholderText={"Select Unit"}
                  allowAdd
                />
              </div>
              <div className="my-1 sm:my-0 sm:mx-1">
                <label
                  className="block font-medium mb-1"
                  htmlFor={`rate-${prod.sr}`}
                >
                  Rate
                </label>
                <Input
                  className="text-right"
                  onChange={(element) => {
                    prod.rate = +element.target.value;
                    calculateAllFields();
                  }}
                  value={prod.rate == 0 ? undefined : prod.rate}
                  id={`rate-${prod.sr}`}
                  placeholder="Enter Rate"
                  type="number"
                />
              </div>
              <div className="my-1 sm:my-0 sm:mx-1">
                <label
                  className="block font-medium mb-1"
                  htmlFor={`amnt-${prod.sr}`}
                >
                  Amount
                </label>
                <Input
                  className="text-right"
                  // onChange={(element) => (prod.amt = +element.target.value)}
                  id={`amnt-${prod.sr}`}
                  value={prod.amt}
                  placeholder="Enter Amount"
                  type="text"
                  readOnly
                />
              </div>
              <div className="my-1 sm:my-0 sm:mx-1">
                <label
                  className="block font-medium mb-1"
                  htmlFor={`amntf-${prod.sr}`}
                >
                  AmountF
                </label>
                <Input
                  className="text-right"
                  id={`amntf-${prod.sr}`}
                  placeholder="Enter AmountF"
                  type="number"
                  readOnly
                  value={prod.amtF}
                />
              </div>
            </div>
          </div>
        ))}
        <div className="flex justify-end">
          <Button
            className="bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-950 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus:ring-gray-300"
            type="button"
            disabled={prods.length >= 13}
            onClick={() => setProds([...prods, newProd(prods.length + 1)])}
          >
            Add Product
          </Button>
        </div>
        <hr />
        <div>
          <label className="block font-medium mb-1" htmlFor="total">
            Total
          </label>
          <Input
            readOnly
            id="total"
            value={form.total}
            // placeholder="Enter Discount %"
            type="number"
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="disc%">
            Discount %
          </label>
          <Input
            onChange={(element) => {
              form.discount = +element.target.value;
              calculateAllFields();
            }}
            id="disc%"
            value={form.discount}
            placeholder="Enter Discount %"
            type="number"
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="discamt">
            Discount Amount
          </label>
          <Input
            readOnly
            id="discamt"
            value={form.discamt}
            placeholder="Discount Amount"
            type="number"
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="pnf">
            PnF
          </label>
          <Input
            onChange={(element) => {
              // setForm({...form, pnf: +element.target.value});
              form.pnf = +element.target.value;
              calculateAllFields();
            }}
            id="pnf"
            value={form.pnf}
            placeholder="Enter PnF"
            type="number"
          />
        </div>

        <div>
          <label className="block font-medium mb-1" htmlFor="lessdiss">
            Less Diss
          </label>
          <Input
            readOnly
            id="lessdiss"
            value={form.lessdisc}
            // placeholder="Enter Discount %"
            type="number"
          />
        </div>
        {/* CGST AND SGST */}
        {vendor?.SGST && vendor.CGST && (
          <>
            <div>
              <label className="block font-medium mb-1" htmlFor="sgst">
                SGST
              </label>
              <Input readOnly id="sgst" value={form.SGST} type="number" />
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="cgst">
                CGST
              </label>
              <Input readOnly id="cgst" value={form.CGST} type="number" />
            </div>
          </>
        )}

        {/* IGST */}
        {vendor?.IGST && (
          <>
            <div>
              <label className="block font-medium mb-1" htmlFor="igst">
                IGST
              </label>
              <Input readOnly id="igst" value={form.IGST} type="number" />
            </div>
          </>
        )}
        <div>
          <label className="block font-medium mb-1" htmlFor="gtotal">
            Gross Total
          </label>
          <Input readOnly id="gtotal" value={form.Gtotal} type="number" />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="gtotalText">
            Gross Total in words
          </label>
          <Input
            id="gtotalText"
            value={"Rupees " + form.GtotalText}
            onChange={(element) =>
              setForm({...form, GtotalText: element.target.value})
            }
            type="text"
          />
        </div>
      </form>
    </div>
  );
};

export default BillForm;
