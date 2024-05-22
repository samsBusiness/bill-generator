import React, {useState, useEffect, useRef} from "react";
import {AgGridReact} from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

import axios from "axios";
import BillForm, {BForm} from "./billForm";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faFileExcel} from "@fortawesome/free-solid-svg-icons";
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from "@radix-ui/react-dropdown-menu";
import {InvoiceDocument} from "@/models/invoice";
import {VendorDocument} from "@/models/vendor";
import {getFinYear, price_in_words, roundto2decimal} from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const InvoiceTable = () => {
  const [rowData, setRowData] = useState<any[]>([]);
  const [editForm, setEditForm] = useState<any>();
  const [showForm, setShowForm] = useState<boolean>(false);
  const [callback, setCallback] = useState<Function>(() => {});
  const gridRef = useRef<any>(null);

  useEffect(() => {
    if (rowData.length == 0) {
      setRowData([{}]);
    }
  }, [rowData]);
  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await axios.get("/api/invoice");
      if (response.data.success) {
        setRowData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  const handleExport = () => {
    const fileName = window.prompt("Enter the file name", "exported_data.xlsx");
    if (fileName) {
      const gridApi = gridRef.current.api;
      gridApi.exportDataAsExcel({
        fileName: fileName,
      });
    }
  };

  const handleDelete = async (params: any) => {
    try {
      const response = await axios.delete(
        "/api/invoice/" + rowData[params.rowIndex]._id
      );
      console.log(response.status);
      if (response.status === 200) {
        fetchInvoices();
      }
      // const createdVendor: Vendor = response.data;
      // setRowData([...rowData, createdVendor]);
    } catch (error) {
      console.error("Error Deleting vendor:", error);
    }
  };

  const handleAdd = () => {
    setShowForm(true);
    setEditForm(null);
    const callback = () => {
      setShowForm(false);
      fetchInvoices();
    };
    setCallback(() => callback);
  };

  const handleBulkSave = async (invoices: any[]) => {
    const form_nos = rowData.map((iv: InvoiceDocument) => iv.no);
    const invoicesToBeAdded = invoices
      .map((iv) => {
        const invoice: any = {};
        for (let i = 2; i < columnDefs.length; i++) {
          if (iv[i - 2] != null) {
            iv[i - 2] = iv[i - 2].trim();
            if (iv[i - 2].length == 0) iv[i - 2] = undefined;
          }
          if (
            !!iv[i - 2] &&
            columnDefs[i].type != null &&
            columnDefs[i].type == "date"
          ) {
            invoice[columnDefs[i].field] = new Date(iv[i - 2]);
          } else if (
            !!iv[i - 2] &&
            columnDefs[i].type != null &&
            columnDefs[i].type == "number"
          ) {
            invoice[columnDefs[i].field] = +iv[i - 2];
          } else {
            invoice[columnDefs[i].field] = iv[i - 2];
          }
        }

        return invoice;
      })
      .filter((iv) => !!iv.no && !form_nos.includes(iv.no));
    try {
      const response = await axios.post("/api/invoice", invoicesToBeAdded, {
        headers: {
          "Content-Type": "application/json",
          "x-bulk-operation": "true",
        },
      });
      console.log(response.status);
      if (response.status === 201 && response.data.success) {
        fetchInvoices();
      }
      // const createdVendor: Vendor = response.data;
      // setRowData([...rowData, createdVendor]);
    } catch (error) {
      console.error("Error creating vendor:", error);
    }
    // console.log(invoicesToBeAdded);
  };

  const handleEdit = async (params: any) => {
    try {
      const editForm: any = {};
      const response = await axios.get("/api/vendors");
      editForm["vendors"] = response.data;
      let vendor;

      if (params.data != null) {
        const products = [];
        const copyForm: any = {...params.data};
        editForm["id"] = copyForm["_id"];
        for (let index = 0; index < 13; index++) {
          if (copyForm[`sr${index + 1}`] == undefined) break;
          products.push({
            sr: copyForm[`sr${index + 1}`],
            part: copyForm[`part${index + 1}`],
            HSN: copyForm[`HSN${index + 1}`],
            QTY: copyForm[`QTY${index + 1}`],
            type: copyForm[`typ${index + 1}`],
            rate: copyForm[`rate${index + 1}`],
            amt: copyForm[`amt${index + 1}`],
            amtF: copyForm[`amtF${index + 1}`],
          });
        }
        if (!!copyForm?.GSTN) {
          vendor = editForm.vendors.find(
            (vendor: VendorDocument) => vendor.GSTNo === copyForm.GSTN
          );
          editForm["vendor"] = vendor;
        }

        editForm["products"] = products;
        editForm["form"] = {
          type: copyForm.type || "",
          no: copyForm.no,
          invNo: copyForm.invNo,
          IDate: !!copyForm.IDate ? new Date(copyForm.IDate) : undefined,
          ChNo: copyForm.ChNo,
          CDate: !!copyForm.CDate ? new Date(copyForm.CDate) : undefined,
          PONo: copyForm.PONo,
          Pdate: !!copyForm.Pdate ? new Date(copyForm.Pdate) : undefined,
          Eway: copyForm.Eway,
          discount: copyForm.discount,
          pnf: copyForm.pnf,
          pname: vendor?.PartyName || "",
          GSTN: vendor?.GSTNo || "",
          add1: vendor?.Add1 || "",
          add2: vendor?.Add2 || "",
          add3: vendor?.Add3 || "",
          SGST: vendor?.SGST ? 0 : undefined,
          CGST: vendor?.CGST ? 0 : undefined,
          IGST: vendor?.IGST ? 0 : undefined,
        };
        const invNo: string = editForm.form.no
          ? getFinYear(editForm.form.IDate) + "/" + editForm.form.no
          : "";
        const total: number = products.reduce((acc, prod) => acc + prod.amt, 0);
        const discamt: number = roundto2decimal(
          ((editForm.form.discount || 0) * total) / 100
        );
        const lessdisc: number = roundto2decimal(
          total - discamt + (editForm.form.pnf || 0)
        );
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
        const GtotalText = price_in_words(Gtotal);
        const calculatedFields: Partial<BForm> = {
          total,
          discamt,
          lessdisc,
          CGST,
          SGST,
          IGST,
          Gtotal,
          invNo,
          GtotalText: !!GtotalText ? GtotalText : "Zero only",
        };
        editForm.form = {...editForm.form, ...calculatedFields};
        const callback = () => {
          setEditForm(null);
          setShowForm(false);
          fetchInvoices();
        };
        setCallback(() => callback);
        setEditForm(editForm);
        setShowForm(true);
        // Ensure this is called after setting form and products
      }
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
    // console.log(params.data);
    // setEditForm(params.data);
  };
  const columnDefs = [
    {
      headerName: "",
      field: "edit",
      width: 50,
      cellRenderer: (params: any) => {
        return (
          // <button
          //   className="rounded-md text-sm"
          //   onClick={() => handleEdit(params)}
          // >
          //   Edit
          // </button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <FontAwesomeIcon icon={faBars} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleEdit(params)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red"
                onClick={() => handleDelete(params)}
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
      editable: false,
      sortable: false,
      filter: false,
    },
    {
      headerName: "Sr",
      field: "_id",
    },
    {
      headerName: "Party Name",
      field: "pname",
    },
    {headerName: "GST Number", field: "GSTN"},
    {headerName: "Address 1", field: "add1"},
    {headerName: "Address 2", field: "add2"},
    {headerName: "Address 3", field: "add3"},
    {headerName: "Type", field: "type"},
    {headerName: "Number", field: "no", type: "number"},
    {headerName: "Invoice Number", field: "invNo"},
    {
      headerName: "Invoice Date",
      field: "IDate",
      type: "date",

      valueFormatter: (params: any) =>
        params.value && new Date(params.value).toLocaleDateString(),
    },
    {headerName: "D", field: "d", type: "number"},
    {headerName: "M", field: "m", type: "number"},
    {headerName: "Y", field: "y", type: "number"},
    {headerName: "Challan Number", field: "ChNo"},
    {
      headerName: "Challan Date",
      field: "CDate",
      type: "date",
      valueFormatter: (params: any) =>
        params.value && new Date(params.value).toLocaleDateString(),
    },
    {headerName: "PO Number", field: "PONo"},
    {
      headerName: "PO Date",
      field: "Pdate",
      type: "date",
      valueFormatter: (params: any) =>
        params.value && new Date(params.value).toLocaleDateString(),
    },
    {headerName: "Eway", field: "Eway"},

    {headerName: "Sr 1", field: "sr1"},
    {headerName: "Part 1", field: "part1"},
    {headerName: "HSN 1", field: "HSN1"},
    {headerName: "Quantity 1", field: "QTY1", type: "number"},
    {headerName: "Type 1", field: "typ1"},
    {headerName: "Rate 1", field: "rate1", type: "number"},
    {headerName: "Amount 1", field: "amt1", type: "number"},
    {headerName: "Amount F 1", field: "amtF1"},

    {headerName: "Sr 2", field: "sr2"},
    {headerName: "Part 2", field: "part2"},
    {headerName: "HSN 2", field: "HSN2"},
    {headerName: "Quantity 2", field: "QTY2", type: "number"},
    {headerName: "Type 2", field: "typ2"},
    {headerName: "Rate 2", field: "rate2", type: "number"},
    {headerName: "Amount 2", field: "amt2", type: "number"},
    {headerName: "Amount F 2", field: "amtF2"},

    {headerName: "Sr 3", field: "sr3"},
    {headerName: "Part 3", field: "part3"},
    {headerName: "HSN 3", field: "HSN3"},
    {headerName: "Quantity 3", field: "QTY3", type: "number"},
    {headerName: "Type 3", field: "typ3"},
    {headerName: "Rate 3", field: "rate3", type: "number"},
    {headerName: "Amount 3", field: "amt3", type: "number"},
    {headerName: "Amount F 3", field: "amtF3"},

    {headerName: "Sr 4", field: "sr4"},
    {headerName: "Part 4", field: "part4"},
    {headerName: "HSN 4", field: "HSN4"},
    {headerName: "Quantity 4", field: "QTY4", type: "number"},
    {headerName: "Type 4", field: "typ4"},
    {headerName: "Rate 4", field: "rate4", type: "number"},
    {headerName: "Amount 4", field: "amt4", type: "number"},
    {headerName: "Amount F 4", field: "amtF4"},

    {headerName: "Sr 5", field: "sr5"},
    {headerName: "Part 5", field: "part5"},
    {headerName: "HSN 5", field: "HSN5"},
    {headerName: "Quantity 5", field: "QTY5", type: "number"},
    {headerName: "Type 5", field: "typ5"},
    {headerName: "Rate 5", field: "rate5", type: "number"},
    {headerName: "Amount 5", field: "amt5", type: "number"},
    {headerName: "Amount F 5", field: "amtF5"},

    {headerName: "Sr 6", field: "sr6"},
    {headerName: "Part 6", field: "part6"},
    {headerName: "HSN 6", field: "HSN6"},
    {headerName: "Quantity 6", field: "QTY6", type: "number"},
    {headerName: "Type 6", field: "typ6"},
    {headerName: "Rate 6", field: "rate6", type: "number"},
    {headerName: "Amount 6", field: "amt6", type: "number"},
    {headerName: "Amount F 6", field: "amtF6"},

    {headerName: "Sr 7", field: "sr7"},
    {headerName: "Part 7", field: "part7"},
    {headerName: "HSN 7", field: "HSN7"},
    {headerName: "Quantity 7", field: "QTY7", type: "number"},
    {headerName: "Type 7", field: "typ7"},
    {headerName: "Rate 7", field: "rate7", type: "number"},
    {headerName: "Amount 7", field: "amt7", type: "number"},
    {headerName: "Amount F 7", field: "amtF7"},

    {headerName: "Sr 8", field: "sr8"},
    {headerName: "Part 8", field: "part8"},
    {headerName: "HSN 8", field: "HSN8"},
    {headerName: "Quantity 8", field: "QTY8", type: "number"},
    {headerName: "Type 8", field: "typ8"},
    {headerName: "Rate 8", field: "rate8", type: "number"},
    {headerName: "Amount 8", field: "amt8", type: "number"},
    {headerName: "Amount F 8", field: "amtF8"},

    {headerName: "Sr 9", field: "sr9"},
    {headerName: "Part 9", field: "part9"},
    {headerName: "HSN 9", field: "HSN9"},
    {headerName: "Quantity 9", field: "QTY9", type: "number"},
    {headerName: "Type 9", field: "typ9"},
    {headerName: "Rate 9", field: "rate9", type: "number"},
    {headerName: "Amount 9", field: "amt9", type: "number"},
    {headerName: "Amount F 9", field: "amtF9"},

    {headerName: "Sr 10", field: "sr10"},
    {headerName: "Part 10", field: "part10"},
    {headerName: "HSN 10", field: "HSN10"},
    {headerName: "Quantity 10", field: "QTY10", type: "number"},
    {headerName: "Type 10", field: "typ10"},
    {headerName: "Rate 10", field: "rate10", type: "number"},
    {headerName: "Amount 10", field: "amt10", type: "number"},
    {headerName: "Amount F 10", field: "amtF10"},

    {headerName: "Sr 11", field: "sr11"},
    {headerName: "Part 11", field: "part11"},
    {headerName: "HSN 11", field: "HSN11"},
    {headerName: "Quantity 11", field: "QTY11", type: "number"},
    {headerName: "Type 11", field: "typ11"},
    {headerName: "Rate 11", field: "rate11", type: "number"},
    {headerName: "Amount 11", field: "amt11", type: "number"},
    {headerName: "Amount F 11", field: "amtF11"},

    {headerName: "Sr 12", field: "sr12"},
    {headerName: "Part 12", field: "part12"},
    {headerName: "HSN 12", field: "HSN12"},
    {headerName: "Quantity 12", field: "QTY12", type: "number"},
    {headerName: "Type 12", field: "typ12"},
    {headerName: "Rate 12", field: "rate12", type: "number"},
    {headerName: "Amount 12", field: "amt12", type: "number"},
    {headerName: "Amount F 12", field: "amtF12"},

    {headerName: "Sr 13", field: "sr13"},
    {headerName: "Part 13", field: "part13"},
    {headerName: "HSN 13", field: "HSN13"},
    {headerName: "Quantity 13", field: "QTY13", type: "number"},
    {headerName: "Type 13", field: "typ13"},
    {headerName: "Rate 13", field: "rate13", type: "number"},
    {headerName: "Amount 13", field: "amt13", type: "number"},
    {headerName: "Amount F 13", field: "amtF13"},

    {headerName: "Discount", field: "discount", type: "number"},
    {headerName: "Discount Amount", field: "discamt", type: "number"},
    {headerName: "PNF", field: "pnf", type: "number"},
    {headerName: "Total", field: "total", type: "number"},
    {headerName: "Less Discount", field: "lessdisc", type: "number"},
    {headerName: "CGST", field: "CGST", type: "number"},
    {headerName: "SGST", field: "SGST", type: "number"},
    {headerName: "IGST", field: "IGST", type: "number"},
    {headerName: "Grand Total", field: "Gtotal", type: "number"},
    {headerName: "Amount in words", field: "GtotalText"},
  ];

  return showForm ? (
    <BillForm editForm={editForm} callback={callback} />
  ) : (
    <>
      <div className="flex justify-between">
        <h1 className="text-4xl text-center">Invoices</h1>
        <div className="flex items-center">
          <button
            className="px-4 py-2 text-gray-500 border-[1px] border-slate-200 hover:bg-slate-600 hover:text-white rounded-md mb-2"
            onClick={handleAdd}
          >
            + Add Invoice
          </button>
          <button
            className="px-4 py-2 text-green-700 text-3xl hover:text-green-800 rounded-md mb-2"
            onClick={handleExport}
          >
            <FontAwesomeIcon icon={faFileExcel} />
          </button>
        </div>
      </div>
      <hr className="w-full mb-8 " />
      <div className="">
        <button
          className="mb-4 border-[1px] border-gray-300 p-2 rounded-md"
          onClick={() => {
            gridRef.current.api.setFilterModel(null);
            gridRef.current.api.onFilterChanged();
          }}
        >
          Reset filters
        </button>
      </div>
      <div className="ag-theme-alpine" style={{height: 600, width: "100%"}}>
        <AgGridReact
          ref={gridRef}
          columnDefs={columnDefs}
          rowData={rowData}
          defaultColDef={{
            sortable: true,
            filter: true,
            suppressMenu: true,
          }}
          enableRangeSelection={true}
          onPasteStart={(value) => {
            console.log(value);
          }}
          onPasteEnd={(value) => {
            console.log("PASTE END:", value);
          }}
          suppressClipboardPaste={false}
          processDataFromClipboard={(params: any) => {
            const invoicesTobeAdded = params.data;
            console.log(invoicesTobeAdded);
            handleBulkSave(invoicesTobeAdded);
            return invoicesTobeAdded;
          }}
          suppressLastEmptyLineOnPaste={true}
          copyHeadersToClipboard={false}
          rowSelection="multiple"
          alwaysShowHorizontalScroll={true}
          pagination={true}
          paginationPageSize={20}
          columnMenu="new"
        />
      </div>
    </>
  );
};

export default InvoiceTable;
