import * as XLSX from 'xlsx';

/**
 * exportCSV — exports an array of objects as a real .xlsx Excel file
 * @param {Object[]} data     - array of flat objects
 * @param {string}   filename - without extension
 */
export function exportCSV(data, filename) {
  if (!data || data.length === 0) return;

  const worksheet  = XLSX.utils.json_to_sheet(data);
  const workbook   = XLSX.utils.book_new();

  // Auto-fit column widths based on content
  const cols = Object.keys(data[0]).map(key => ({
    wch: Math.max(
      key.length,
      ...data.map(row => String(row[key] ?? '').length)
    ) + 2,
  }));
  worksheet['!cols'] = cols;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  const dated = `${filename}_${new Date().toISOString().slice(0, 10)}`;
  XLSX.writeFile(workbook, `${dated}.xlsx`);
}
