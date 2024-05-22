import React, {useEffect, useRef, useState} from "react";
import {AgGridReact} from "ag-grid-react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faBars, faPlus, faSave} from "@fortawesome/free-solid-svg-icons";
import "ag-grid-enterprise";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {ColDef, NewValueParams} from "ag-grid-community";

import axios from "axios";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface Vendor {
  _id?: string;
  PartyName: string;
  GSTNo: string;
  Add1: string;
  Add2: string;
  Add3: string;
  CGST: boolean | string;
  SGST: boolean | string;
  IGST: boolean | string;
  isNew?: boolean;
  isEditable?: boolean;
}

const VendorTable: React.FC = () => {
  const [rowData, setRowData] = useState<Vendor[]>([]);
  const gridRef = useRef<any>(null);

  useEffect(() => {
    console.log("EDITED", rowData);
  }, [rowData]);
  useEffect(() => {
    fetchVendors();
  }, []);

  const fetchVendors = async () => {
    try {
      const response = await axios.get("/api/vendors");
      const vendors = response.data.map((vendor: any) => ({
        ...vendor,
        SGST: vendor.SGST ? "y" : "n",
        CGST: vendor.CGST ? "y" : "n",
        IGST: vendor.IGST ? "y" : "n",
      }));
      setRowData(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    }
  };

  const isCellEditable = (params: any) => {
    return params.data.isEditable;
  };

  const handleEdit = (params: any) => {
    const rowIndex = params.rowIndex;
    const updatedData = rowData.map((row, index) => {
      if (index === rowIndex) {
        row.isEditable = true;
      }
      return row;
    });
    setRowData([...updatedData]);

    // gridRef.current.api.forEachNode((node: any) => {
    //   if (node.rowIndex === rowIndex) {
    //     Object.keys(node.data).forEach((colKey) => {
    //       if (
    //         colKey !== "edit" &&
    //         colKey !== "isNew" &&
    //         colKey !== "isEditable"
    //       ) {
    //         gridRef.current.api.startEditingCell({
    //           rowIndex,
    //           colKey,
    //         });
    //       }
    //     });
    //   }
    // });
  };

  // const handleExport = (params:) => {

  // }

  const handleAdd = async (params: any) => {
    const newVendor: Vendor = {
      PartyName: params.data.PartyName,
      GSTNo: params.data.GSTNo,
      Add1: params.data.Add1,
      Add2: params.data.Add2,
      Add3: params.data.Add3,
      CGST: params.data.CGST,
      SGST: params.data.SGST,
      IGST: params.data.IGST,
    };

    try {
      const response = await axios.post("/api/vendors", newVendor);
      console.log(response.status);
      if (response.status === 201) {
        fetchVendors();
      }
      // const createdVendor: Vendor = response.data;
      // setRowData([...rowData, createdVendor]);
    } catch (error) {
      console.error("Error creating vendor:", error);
    }
  };

  const handleDelete = async (params: any) => {
    try {
      const response = await axios.delete(
        "/api/vendors/" + rowData[params.rowIndex]._id
      );
      console.log(response.status);
      if (response.status === 200) {
        fetchVendors();
      }
      // const createdVendor: Vendor = response.data;
      // setRowData([...rowData, createdVendor]);
    } catch (error) {
      console.error("Error Deleting vendor:", error);
    }
  };

  const handleSave = async (params: any) => {
    const updatedVendor: Vendor = {
      PartyName: params.data.PartyName,
      GSTNo: params.data.GSTNo,
      Add1: params.data.Add1,
      Add2: params.data.Add2,
      Add3: params.data.Add3,
      CGST: params.data.CGST == "y",
      SGST: params.data.SGST == "y",
      IGST: params.data.IGST == "y",
    };

    try {
      const response = await axios.put(
        "/api/vendors/" + rowData[params.rowIndex]._id,
        updatedVendor
      );
      console.log(response.status);
      if (response.status === 200) {
        fetchVendors();
      }
      // const createdVendor: Vendor = response.data;
      // setRowData([...rowData, createdVendor]);
    } catch (error) {
      console.error("Error creating vendor:", error);
    }
  };

  const handleBulkSave = async (vendors: any[]) => {
    const gstNos = rowData.map((v: Vendor) => v.GSTNo);
    const vendorsTobeAdded = vendors
      .map((v) => {
        const vendor: Vendor = {
          PartyName: v[0],
          GSTNo: v[1],
          Add1: v[2],
          Add2: v[3],
          Add3: v[4],
          CGST: v[5] == "y" || v[5] == "Y",
          SGST: v[6] == "y" || v[6] == "Y",
          IGST: v[7] == "y" || v[7] == "Y",
        };
        return vendor;
      })
      .filter((v) => !!v.GSTNo && !gstNos.includes(v.GSTNo));
    try {
      const response = await axios.post("/api/vendors", vendorsTobeAdded, {
        headers: {
          "Content-Type": "application/json",
          "x-bulk-operation": "true",
        },
      });
      console.log(response.status);
      if (response.status === 200) {
        fetchVendors();
      }
      // const createdVendor: Vendor = response.data;
      // setRowData([...rowData, createdVendor]);
    } catch (error) {
      console.error("Error creating vendor:", error);
    }
  };

  const columnDefs: ColDef[] = [
    {
      headerName: "",
      field: "edit",
      width: 50,
      cellRenderer: (params: any) => {
        return params.data.isEditable ? (
          params.data.isNew ? (
            <button onClick={() => handleAdd(params)}>
              <FontAwesomeIcon icon={faPlus} />
            </button>
          ) : (
            <button onClick={() => handleSave(params)}>
              <FontAwesomeIcon icon={faSave} />
            </button>
          )
        ) : (
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
      headerName: "Party Name",
      field: "PartyName",
      editable: isCellEditable,
      filter: true,
      sortable: true,
    },
    {
      headerName: "GST No",
      field: "GSTNo",
      editable: isCellEditable,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Address 1",
      field: "Add1",
      editable: isCellEditable,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Address 2",
      field: "Add2",
      editable: isCellEditable,
      filter: true,
      sortable: true,
    },
    {
      headerName: "Address 3",
      field: "Add3",
      editable: isCellEditable,
      filter: true,
      sortable: true,
    },
    {
      headerName: "SGST",
      field: "SGST",
      editable: isCellEditable,
      filter: true,
      sortable: true,
      onCellValueChanged: (params: NewValueParams) => {
        if (params.node?.rowIndex != null) {
          rowData[params.node?.rowIndex]["CGST"] = params.newValue;
          rowData[params.node?.rowIndex]["IGST"] =
            params.newValue == "y" ? "n" : "y";
          setRowData([...rowData]);
        }
      },
      // cellRenderer: (params: any) => (params.value ? "y" : "n"),
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {values: ["y", "n"]},
    },
    {
      headerName: "CGST",
      field: "CGST",
      editable: isCellEditable,
      filter: true,
      sortable: true,
      onCellValueChanged: (params: NewValueParams) => {
        if (params.node?.rowIndex != null) {
          rowData[params.node?.rowIndex]["SGST"] = params.newValue;
          rowData[params.node?.rowIndex]["IGST"] =
            params.newValue == "y" ? "n" : "y";
          setRowData([...rowData]);
        }
      },
      // cellRenderer: (params: any) => (params.value ? "y" : "n"),
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {values: ["y", "n"]},
    },

    {
      headerName: "IGST",
      field: "IGST",
      editable: isCellEditable,
      filter: true,
      sortable: true,
      // cellRenderer: (params: any) => (params.value== ? "y" : "n"),
      onCellValueChanged: (params: NewValueParams) => {
        if (params.node?.rowIndex != null) {
          rowData[params.node?.rowIndex]["CGST"] = rowData[
            params.node?.rowIndex
          ]["SGST"] = params.newValue == "y" ? "n" : "y";
          setRowData([...rowData]);
        }
      },
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {values: ["y", "n"]},
    },
  ];

  const addNewRow = () => {
    rowData.unshift({
      PartyName: "",
      GSTNo: "",
      Add1: "",
      Add2: "",
      Add3: "",
      CGST: "y",
      SGST: "y",
      IGST: "n",
      isNew: true,
      isEditable: true,
    });
    setRowData([...rowData]);
  };

  return (
    <div style={{width: "100%", height: "100%"}}>
      <div className="flex justify-between">
        <h1 className="text-4xl text-center">Vendors</h1>
        <button
          className="px-4 py-2 text-gray-500 text-xl border-[1px] border-slate-200 hover:bg-slate-600 hover:text-white rounded-md mb-2"
          onClick={addNewRow}
        >
          + Add Vendor
        </button>
      </div>
      <hr className="w-full mb-8 " />
      {/* <button onClick={addNewRow} style={{marginBottom: "10px"}}>
        Add New Row
      </button> */}
      <div className="ag-theme-alpine ag-grid-react always-show-horizontal-scroll">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            resizable: true,
            suppressMenu: true,
            filter: true,
          }}
          // singleClickEdit={true}
          domLayout="autoHeight"
          enableRangeSelection={true}
          groupSelectsChildren={true}
          onPasteStart={(value) => {
            console.log(value);
          }}
          onPasteEnd={(value) => {
            console.log("PASTE END:", value);
          }}
          suppressClipboardPaste={false}
          processDataFromClipboard={(params) => {
            const vendorsTobeAdded = params.data;
            console.log(vendorsTobeAdded);
            handleBulkSave(vendorsTobeAdded);
            return vendorsTobeAdded;
          }}
          suppressLastEmptyLineOnPaste={true}
          copyHeadersToClipboard={false}
          rowSelection="multiple"
          alwaysShowHorizontalScroll={true}
          gridOptions={{alwaysShowHorizontalScroll: true}}
          pagination={true}
          paginationPageSize={20}
          columnMenu="new"
        />
      </div>
    </div>
  );
};

export default VendorTable;
