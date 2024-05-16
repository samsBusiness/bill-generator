import React, {useEffect, useState} from "react";
import {
  SelectValue,
  SelectTrigger,
  SelectItem,
  SelectContent,
  Select,
} from "@/components/ui/select";
import {Input} from "@/components/ui/input";
import {PopoverTrigger, PopoverContent, Popover} from "@/components/ui/popover";
import {Calendar} from "@/components/ui/calendar";
import {Button} from "@/components/ui/button";
import axios from "axios";
import {VendorDocument} from "@/models/vendor";
import Dateformat from "dateformat";
import FormattedBill from "./formattedBill";
import {Combobox} from "./combobox";
export interface Product {
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
}

const initialValues: BForm = {
  pname: "",
  GSTN: "",
  type: "",
  prods: [],
  total: 0,
  Gtotal: 0,
};

const getFinYear = () => {
  const currentDate = new Date();
  const march1st = new Date();
  march1st.setDate(1);
  march1st.setMonth(2);
  let currentYear;
  if (currentDate >= march1st) {
    currentYear = currentDate.getFullYear();
  } else {
    currentYear = currentDate.getFullYear() - 1;
  }
  return (
    currentYear.toString().substring(2) +
    "-" +
    (currentYear + 1).toString().substring(2)
  );
};

const newProd = (srno: number) => ({
  sr: srno,
  part: "",
  HSN: 8207,
  QTY: 0,
  type: "Kgs",
  rate: 0,
  amt: 0,
  amtF: "",
});

const BillForm = () => {
  const [form, setForm] = useState<BForm>(initialValues);
  // const types = ["Invoice", "Challan"];
  const [vendors, setVendors] = useState([]);
  const [vendor, setVendor] = useState<VendorDocument>();
  const [prods, setProds] = useState<Product[]>([newProd(1)]);
  const [preview, setPreview] = useState(false);
  const [IdatepopoverOpen, setIdatepopoverOpen] = useState(false);
  const [CdatepopoverOpen, setCdatepopoverOpen] = useState(false);
  const [PdatepopoverOpen, setPdatepopoverOpen] = useState(false);

  useEffect(() => {
    axios.get("/api/vendors").then((response) => {
      // setVendors(
      //   response.data?.map((vendor: VendorDocument) => ({
      //     label: `${vendor.PartyName} (${vendor.GSTNo})`,
      //     value: vendor,
      //   }))
      // );
      setVendors(response.data);
    });
  }, []);

  useEffect(() => {
    setForm({
      ...form,
      pname: vendor?.PartyName || "",
      GSTN: vendor?.GSTNo || "",
      add1: vendor?.Add1 || "",
      add2: vendor?.Add2 || "",
      add3: vendor?.Add3 || "",
    });
  }, [vendor]);

  const handleSubmit = () => {
    setForm({...form, prods: [...prods]});
    setPreview(true);
  };

  const calculateAllFields = () => {
    console.log("CHANGED");
    prods.forEach((prod) => {
      prod.amt = prod.rate * prod.QTY;
      prod.amtF = prod.amt == 0 ? "" : prod.amt.toString();
    });
    setProds([...prods]);
    const invNo: string = form.no ? getFinYear() + "/" + form.no : "";
    const total: number = prods.reduce((acc, prod) => acc + prod.amt, 0);
    const discamt: number = ((form.discount || 0) * total) / 100;
    const lessdisc: number = total - discamt + (form.pnf || 0);
    const CGST = vendor?.CGST ? (lessdisc * 9) / 100 : undefined;
    const SGST = vendor?.SGST ? (lessdisc * 9) / 100 : undefined;
    const IGST = vendor?.IGST ? (lessdisc * 18) / 100 : undefined;
    const Gtotal: number = lessdisc + (CGST || 0) + (SGST || 0) + (IGST || 0);
    const calculatedFields: Partial<BForm> = {
      total,
      discamt,
      lessdisc,
      CGST,
      SGST,
      IGST,
      Gtotal: Math.round((Gtotal + Number.EPSILON) * 100) / 100,
      invNo,
    };
    setForm({...form, ...calculatedFields});
  };

  return preview ? (
    <>
      <div className="flex justify-end">
        <Button className="mx-5 bg-green-700 text-white">Accept</Button>
        <Button
          className="bg-red-500 text-white"
          onClick={() => setPreview(false)}
        >
          Go Back to form
        </Button>
      </div>
      <FormattedBill form={form} />
    </>
  ) : (
    <div className=" mx-auto mt-8 relative">
      <div className="flex justify-between sticky top-5">
        <h2 className="text-2xl font-bold mb-4">Product Form</h2>
        <Button
          onClick={handleSubmit}
          className="bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-950 dark:bg-gray-50 dark:text-gray-900 dark:hover:bg-gray-50/90 dark:focus:ring-gray-300"
          type="submit"
        >
          Preview Bill
        </Button>
      </div>
      <form className="space-y-4 ">
        <div className="w-full">
          <label className="block font-medium mb-1" htmlFor="pname">
            Product Name
          </label>
          <div className="flex">
            <Combobox
              id="pname"
              className="w-full"
              items={vendors.map((v: VendorDocument) => ({
                label: `${v.PartyName} (${v.GSTNo})`,
                value: JSON.stringify(v),
              }))}
              onChange={(value: any) =>
                setVendor(value ? JSON.parse(value) : "")
              }
              placeholderText={"Select Party"}
            />
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
            placeholder="Enter GST"
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
            placeholder="Enter GST"
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
            placeholder="Enter GST"
            type="text"
          />
        </div>
        <div>
          <label className="block font-medium mb-1" htmlFor="type">
            Type
          </label>
          <Select onValueChange={(value) => setForm({...form, type: value})}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Invoice">Invoice</SelectItem>
              <SelectItem value="Challan">Challan</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* INVOICE *************************************************************/}
        {form.type === "Invoice" && (
          <>
            <div>
              <label className="block font-medium mb-1" htmlFor="no">
                No
              </label>
              <Input
                id="num"
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
            <div>
              <label className="block font-medium mb-1" htmlFor="date">
                Invoice Date
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
                      setForm({...form, IDate: day});
                      setIdatepopoverOpen(false); //
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </>
        )}
        {/* CHALAN *************************************************************/}
        {form.type === "Challan" && (
          <>
            <div>
              <label className="block font-medium mb-1" htmlFor="no">
                No
              </label>
              <Input
                id="num"
                value={form.no}
                onChange={(event) => setForm({...form, no: event.target.value})}
                placeholder="Enter Number"
                type="number"
              />
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="gst">
                Chalan No
              </label>
              <Input
                id="chno"
                defaultValue={form.no ? getFinYear() + "/" + form.no : ""}
                onChange={(event) =>
                  setForm({...form, ChNo: event.target.value})
                }
                placeholder="Enter Chalan Number"
                type="text"
              />
            </div>
            <div>
              <label className="block font-medium mb-1" htmlFor="chdate">
                Chalan Date
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
        )}
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
            PO Date
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
            <div className="w-full flex justify-between items-center">
              <h1>PRODUCT {idx + 1}</h1>
              <Button
                className=" text-sm  bg-red-500"
                disabled={prods.length <= 1}
                onClick={() =>
                  setProds(prods.filter((prod) => prod.sr != idx + 1))
                }
              >
                Delete
              </Button>
            </div>
            <div
              key={"prod-" + idx}
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
                  onChange={(element) => (prod.HSN = +element.target.value)}
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
                  value={prod.QTY}
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
                <Select
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
                </Select>
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
                  value={prod.rate}
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
      </form>
    </div>
  );
};

export default BillForm;
