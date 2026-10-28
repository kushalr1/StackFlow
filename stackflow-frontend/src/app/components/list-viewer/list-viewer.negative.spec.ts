import { TestBed } from '@angular/core/testing';
import { ListViewer } from './list-viewer';
import { ListViewerService } from '../../services/list-viewer.service';
import { ChatList } from '../../models/chat';

function listOf(rows: number, title = 'Attendance — October 2026'): ChatList {
  return {
    title,
    columns: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    rows: Array.from({ length: rows }, (_, index) => ({
      name: { text: `Employee ${index}`, sort: `Employee ${index}` },
      status: { text: index % 2 ? 'Present' : 'Absent', sort: index % 2 ? 'Present' : 'Absent' },
    })),
    totalCount: rows,
  };
}

describe('ListViewer negative cases', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<ListViewer>>;
  let service: ListViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ListViewer] });
    service = TestBed.inject(ListViewerService);
    fixture = TestBed.createComponent(ListViewer);
  });

  afterEach(() => service.close());

  it('closes on Escape', () => {
    service.open(listOf(3));
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

    expect(service.current()).toBeNull();
  });

  it('closes when the dimmed backdrop is clicked', () => {
    service.open(listOf(3));
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.backdrop') as HTMLElement).click();

    expect(service.current()).toBeNull();
  });

  it('stays open when a click lands inside the sheet', () => {
    service.open(listOf(3));
    fixture.detectChanges();

    (fixture.nativeElement.querySelector('.sheet') as HTMLElement).click();

    expect(service.current()).not.toBeNull();
  });

  it('sorts ascending, then descending, on a second click of the same header', () => {
    service.open(listOf(3));
    fixture.detectChanges();
    const nameSort = (): HTMLButtonElement => fixture.nativeElement.querySelector('th button.sort');

    nameSort().click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('th[aria-sort]').getAttribute('aria-sort')).toBe('ascending');

    nameSort().click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('th[aria-sort]').getAttribute('aria-sort')).toBe('descending');
    expect(fixture.nativeElement.querySelector('tbody tr td').textContent.trim()).toBe('Employee 2');
  });

  it('disables both export buttons for an empty dataset', () => {
    service.open(listOf(0));
    fixture.detectChanges();

    const buttons = (Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[])
      .filter((button) => ['CSV', 'Excel'].includes(button.textContent?.trim() ?? ''));
    expect(buttons.length).toBe(2);
    expect(buttons.every((button) => button.disabled)).toBe(true);
  });

  it('renders a row that is missing a column without throwing', () => {
    const broken = listOf(2);
    delete (broken.rows[0] as Record<string, unknown>)['status'];
    service.open(broken);

    expect(() => fixture.detectChanges()).not.toThrow();
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(2);
  });

  it('ignores extra fields the server did not ask for', () => {
    const extra = listOf(1) as ChatList & { secret?: string };
    extra.secret = 'do-not-render';
    (extra.rows[0] as Record<string, unknown>)['salary'] = { text: '₹99,999.00', sort: 99999 };
    service.open(extra);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).not.toContain('do-not-render');
    expect(fixture.nativeElement.textContent).not.toContain('₹99,999.00');
  });

  it('renders a very long cell value without throwing', () => {
    const long = listOf(1);
    long.rows[0]['name'] = { text: 'x'.repeat(5000), sort: 'x' };
    service.open(long);

    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
