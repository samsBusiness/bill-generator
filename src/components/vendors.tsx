import React, {useEffect, useRef, useState} from "react";
import {AgGridReact} from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {ColDef} from "ag-grid-community";
import axios from "axios";

interface Vendor {
  PartyName: string;
  GSTNo: string;
  Add1: string;
  Add2: string;
  Add3: string;
  CGST: boolean;
  SGST: boolean;
  IGST: boolean;
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
      setRowData(response.data);
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

  const handleSubmit = async (params: any) => {
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

  //   const handleSubmit = (params: any) => {
  //     const rowIndex = params.rowIndex;
  //     const updatedData = rowData.map((row, index) => {
  //       if (index === rowIndex) {
  //         row.isNew = false;
  //         row.isEditable = false;
  //         console.log("Submitted Row Data:", row);
  //       }
  //       return row;
  //     });
  //     setRowData([...updatedData]);
  //   };
  const [columnDefs] = useState<ColDef[]>([
    {
      headerName: "",
      field: "edit",
      cellRenderer: (params: any) => {
        return params.data.isEditable ? (
          <button
            className="bg-gray-300 p-2 w-1/2 ml-[25%] rounded-md text-sm text-center"
            onClick={() => handleSubmit(params)}
          >
            Submit
          </button>
        ) : (
          <button
            className="bg-gray-300 p-2 w-1/2 ml-[25%] rounded-md text-sm"
            onClick={() => handleEdit(params)}
          >
            Edit
          </button>
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
      headerName: "CGST",
      field: "CGST",
      editable: isCellEditable,
      filter: true,
      sortable: true,
      cellRenderer: (params: any) => (params.value ? "Y" : "N"),
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {values: [true, false]},
    },
    {
      headerName: "SGST",
      field: "SGST",
      editable: isCellEditable,
      filter: true,
      sortable: true,
      cellRenderer: (params: any) => (params.value ? "Y" : "N"),
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {values: [true, false]},
    },
    {
      headerName: "IGST",
      field: "IGST",
      editable: isCellEditable,
      filter: true,
      sortable: true,
      cellRenderer: (params: any) => (params.value ? "Y" : "N"),
      cellEditor: "agSelectCellEditor",
      cellEditorParams: {values: [true, false]},
    },
  ]);

  const addNewRow = () => {
    rowData.push({
      PartyName: "",
      GSTNo: "",
      Add1: "",
      Add2: "",
      Add3: "",
      CGST: false,
      SGST: false,
      IGST: false,
      isNew: true,
      isEditable: true,
    });
    setRowData([...rowData]);
  };

  return (
    <div style={{width: "100%", height: "100%"}}>
      <button onClick={addNewRow} style={{marginBottom: "10px"}}>
        Add New Row
      </button>
      <div className="ag-theme-alpine ag-grid-react always-show-horizontal-scroll">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={{
            resizable: true,
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
            console.log(params);
            return null;
          }}
          suppressLastEmptyLineOnPaste={true}
          copyHeadersToClipboard={false}
          rowSelection="multiple"
          alwaysShowHorizontalScroll={true}
          gridOptions={{alwaysShowHorizontalScroll: true}}
        />
      </div>
    </div>
  );
};

export default VendorTable;
