import { ChatCell, ChatList, ChatListRow } from '../models/chat';

/** UTF-8 byte-order mark, so Excel reads ₹ and Hindi text correctly. */
const utf8Bom = '﻿';

/** Title to a file-safe slug, plus the export date: "Projects — October 2026" → "projects-october-2026-2026-10-28". */
export function listFileName(title: string, date: Date): string {
  const slug = title
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'list'}-${isoDate(date)}`;
}

/** CSV with column labels as the header row. Cells holding commas, quotes or newlines are quoted. */
export function toCsv(list: ChatList, rows: ChatListRow[]): string {
  const header = list.columns.map((column) => csvField(column.label));
  const body = rows.map((row) => list.columns.map((column) => csvField(row[column.key]?.text ?? '')));
  return utf8Bom + [header, ...body].map((line) => line.join(',')).join('\r\n');
}

/** A cell starting with = + - @ (or tab / CR) runs as a formula in Excel or Sheets; a leading apostrophe keeps it text. */
const formulaTrigger = /^[=+\-@\t\r]/;

export function csvField(value: string): string {
  const safe = formulaTrigger.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

/** Excel cells: numbers and money stay numeric so Excel can sum them; everything else is text. */
export function toSheetRows(list: ChatList, rows: ChatListRow[]): (string | number)[][] {
  const header = list.columns.map((column) => column.label);
  const body = rows.map((row) =>
    list.columns.map((column) => {
      const cell: ChatCell | undefined = row[column.key];
      if (!cell) return '';
      const numeric = column.type === 'number' || column.type === 'currency';
      return numeric && typeof cell.sort === 'number' ? cell.sort : cell.text;
    }),
  );
  return [header, ...body];
}

export function downloadCsv(list: ChatList, rows: ChatListRow[], date = new Date()): void {
  const blob = new Blob([toCsv(list, rows)], { type: 'text/csv;charset=utf-8' });
  saveBlob(blob, `${listFileName(list.title, date)}.csv`);
}

/** Loads SheetJS on first use, so the main bundle does not carry it. */
export async function downloadXlsx(list: ChatList, rows: ChatListRow[], date = new Date()): Promise<void> {
  const XLSX = await import('xlsx');
  const sheet = XLSX.utils.aoa_to_sheet(toSheetRows(list, rows));
  sheet['!cols'] = list.columns.map((column) => ({ wch: Math.min(Math.max(column.label.length + 4, 14), 60) }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, list.title.slice(0, 31).replace(/[\\/?*[\]:]/g, ' ') || 'List');
  XLSX.writeFile(workbook, `${listFileName(list.title, date)}.xlsx`);
}

function isoDate(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function saveBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
