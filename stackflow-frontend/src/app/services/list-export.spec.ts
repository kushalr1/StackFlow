import { csvField, listFileName, toCsv, toSheetRows } from './list-export';
import { ChatList } from '../models/chat';

const list: ChatList = {
  title: 'Projects — October 2026',
  columns: [
    { key: 'name', label: 'Project', type: 'text' },
    { key: 'salary', label: 'Salary', type: 'currency' },
  ],
  rows: [
    { name: { text: 'Rx, "tile"', sort: 'Rx, "tile"' }, salary: { text: '₹1,23,456.00', sort: 123456 } },
    { name: { text: 'Line\nbreak', sort: 'Line\nbreak' }, salary: { text: '₹10.00', sort: 10 } },
  ],
  totalCount: 2,
};

describe('list export', () => {
  it('starts the CSV with a UTF-8 BOM so Excel shows ₹ and Hindi text', () => {
    expect(toCsv(list, list.rows).charCodeAt(0)).toBe(0xfeff);
  });

  it('uses column labels as the header and writes display text for each cell', () => {
    const lines = toCsv(list, list.rows).slice(1).split('\r\n');

    expect(lines[0]).toBe('Project,Salary');
    expect(lines[1]).toBe('"Rx, ""tile""","₹1,23,456.00"');
  });

  it('quotes fields with commas, quotes or newlines and doubles embedded quotes', () => {
    expect(csvField('plain')).toBe('plain');
    expect(csvField('a,b')).toBe('"a,b"');
    expect(csvField('say "hi"')).toBe('"say ""hi"""');
    expect(csvField('line\nnext')).toBe('"line\nnext"');
  });

  it('exports only the rows it is given, so a search filter narrows the file', () => {
    const csv = toCsv(list, [list.rows[1]]);

    expect(csv).toContain('Line');
    expect(csv).not.toContain('tile');
  });

  it('keeps money numeric in Excel rows', () => {
    const [, firstRow] = toSheetRows(list, list.rows);

    expect(firstRow[1]).toBe(123456);
  });

  it('names the file from the title and the export date', () => {
    expect(listFileName('Projects — October 2026', new Date(2026, 9, 28))).toBe('projects-october-2026-2026-10-28');
  });
});
