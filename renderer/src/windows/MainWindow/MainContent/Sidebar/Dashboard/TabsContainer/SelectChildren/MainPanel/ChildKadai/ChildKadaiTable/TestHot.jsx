import React from "react";
import { HotTable } from "@handsontable/react";

// ← これを handsontable.css に変更！！
import "handsontable/dist/handsontable.css";

export default function TestHot() {
  const data = [
    ["タイトル", "", ""],
    ["A", "B", "C"],
    ["D", "E", "F"],
  ];

  const mergeCells = [
    { row: 0, col: 0, rowspan: 1, colspan: 3 },
  ];

  return (
    <div style={{ height: "400px", overflow: "hidden" }}>
      <HotTable
        data={data}
        colHeaders={true}
        rowHeaders={true}
        mergeCells={mergeCells}
        licenseKey="non-commercial-and-evaluation"
      />
    </div>
  );
}
