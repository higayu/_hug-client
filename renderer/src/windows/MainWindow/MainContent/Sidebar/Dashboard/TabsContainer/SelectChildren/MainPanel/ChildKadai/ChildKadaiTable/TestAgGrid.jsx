import React from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";

export default function TestAgGrid() {
  const columnDefs = [
    {
      field: "title",
      colSpan: () => 3,
      cellStyle: {
        textAlign: "center",
        backgroundColor: "#FFECAA",
        color: "#333",
        fontWeight: "bold",
      },
    },
    { field: "col1" },
    { field: "col2" },
  ];

  const rowData = [
    { title: "タイトル", col1: "", col2: "" },
    { title: "", col1: "A", col2: "B" },
    { title: "", col1: "C", col2: "D" },
  ];

  return (
    <div className="ag-theme-alpine" style={{ height: 300, width: 600 }}>
      <AgGridReact
        theme="legacy"  // ★ これでエラー解消
        columnDefs={columnDefs}
        rowData={rowData}
      />
    </div>
  );
}
