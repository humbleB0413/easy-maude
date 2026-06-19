/**
 * @file excelExport.js
 * @description
 *   Exports search results to an .xlsx file using SheetJS (xlsx).
 *   Function: exportToExcel.
 */

import * as XLSX from 'xlsx';
import logger from './logger.js';

/**
 * Exports an array of OpenFDA event records to an .xlsx file.
 * @param {Array} results - Raw OpenFDA event records
 * @param {string} filename - Output filename without extension
 */
export function exportToExcel(results, filename = 'maude_results') {
  try {
    const rows = results.map((r, i) => ({
      'No.':             i + 1,
      'Brand Name':      r.device?.[0]?.brand_name ?? '',
      'Generic Name':    r.device?.[0]?.generic_name ?? '',
      'Manufacturer':    r.device?.[0]?.manufacturer_d_name ?? '',
      'Model Number':    r.device?.[0]?.model_number ?? '',
      'Product Code':    r.device?.[0]?.device_report_product_code ?? '',
      'Event Type':      r.event_type ?? '',
      'Date Received':   r.date_received ?? '',
      'Date of Event':   r.date_of_event ?? '',
      'MDR Report Key':  r.mdr_report_key ?? '',
      'Reporter':        r.reporter_occupation_code ?? '',
      'Product Problems': (r.product_problems ?? []).join('; '),
      'Event Description': r.mdr_text?.[0]?.text ?? '',
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'MAUDE Results');
    XLSX.writeFile(wb, `${filename}.xlsx`);
    logger.info('excelExport', `Exported ${rows.length} records to ${filename}.xlsx`);
  } catch (e) {
    logger.error('excelExport', 'Export failed', e);
    throw e;
  }
}
