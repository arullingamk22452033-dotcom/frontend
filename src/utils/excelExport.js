import * as XLSX from "xlsx";
import { saveAs } from "file-saver";


// 🔥 EXPORT ALL DATA
export const exportToExcel = (data, fileName = "Report") => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  const excelBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array"
  });

  const fileData = new Blob([excelBuffer], {
    type: "application/octet-stream"
  });

  saveAs(fileData, `${fileName}.xlsx`);
};


// 🔥 EXPORT SINGLE WORKER
export const exportSingleWorker = (worker) => {
  const last = worker.attendance?.[worker.attendance.length - 1];

  const data = [
    {
      Name: worker.name,
      Wage: worker.wage,
      Status: last?.status || "Not Marked",
      Date: last?.date
        ? new Date(last.date).toLocaleDateString()
        : "-"
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "Worker");

  const excelBuffer = XLSX.write(wb, {
    bookType: "xlsx",
    type: "array"
  });

  const fileData = new Blob([excelBuffer], {
    type: "application/octet-stream"
  });

  saveAs(fileData, `${worker.name}_report.xlsx`);
};