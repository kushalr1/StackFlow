import { ChatList } from '../models/chat';
import { vi } from 'vitest';
import { csvField, downloadCsv, listFileName, toCsv } from './list-export';

const list: ChatList = {
  title: 'Salaries',
  columns: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'pay', label: 'Pay', type: 'currency' },
  ],
  rows: [],
  totalCount: 0,
};

describe('CSV formula injection', () => {
  it.each([
    ['=HYPERLINK("x")', `"'=HYPERLINK(""x"")"`],
    ['+cmd', "'+cmd"],
    ['-2+3', "'-2+3"],
    ['@SUM(1,1)', `"'@SUM(1,1)"`],
    ['\t=1+1', "'\t=1+1"],
    ['\r=1+1', `"'\r=1+1"`],
  ])('neutralizes a cell starting with a formula trigger: %j', (cell, expected) => {
    expect(csvField(cell)).toBe(expected);
  });

  it('leaves ordinary text and rupee amounts untouched', () => {
    expect(csvField('Arnav')).toBe('Arnav');
    expect(csvField('₹45,000.00')).toBe('"₹45,000.00"');
  });

  it('neutralizes a formula cell inside a full export, not only in isolation', () => {
    const exported = toCsv(
      { ...list, rows: [{ name: { text: '=1+1', sort: '=1+1' }, pay: { text: '₹1.00', sort: 1 } }], totalCount: 1 },
      [{ name: { text: '=1+1', sort: '=1+1' }, pay: { text: '₹1.00', sort: 1 } }],
    );

    expect(exported).toContain("'=1+1,");
  });
});

describe('CSV content', () => {
  it('writes only the header row, with the BOM, for an empty dataset', () => {
    const exported = toCsv(list, []);

    expect(exported.charCodeAt(0)).toBe(0xfeff);
    expect(exported.slice(1)).toBe('Name,Pay');
  });

  it('preserves Hindi text and rupee symbols', () => {
    const exported = toCsv(
      { ...list, rows: [] },
      [{ name: { text: 'अर्णव शर्मा', sort: 'अर्णव शर्मा' }, pay: { text: '₹1,23,456.00', sort: 123456 } }],
    );

    expect(exported).toContain('अर्णव शर्मा');
    expect(exported).toContain('"₹1,23,456.00"');
  });
});

describe('listFileName', () => {
  it('falls back to "list" when the title has no letters or digits', () => {
    expect(listFileName('— —', new Date(2026, 9, 28))).toBe('list-2026-10-28');
  });

  it('keeps the export date in yyyy-mm-dd form in local time', () => {
    expect(listFileName('Projects', new Date(2026, 0, 5))).toBe('projects-2026-01-05');
  });
});
