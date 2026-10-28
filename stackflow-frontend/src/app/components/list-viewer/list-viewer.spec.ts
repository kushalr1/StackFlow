import { TestBed } from '@angular/core/testing';
import { ListViewer } from './list-viewer';
import { ListViewerService } from '../../services/list-viewer.service';
import { ChatList } from '../../models/chat';

function bigList(count: number): ChatList {
  return {
    title: 'Attendance — October 2026',
    subtitle: 'Employee A',
    columns: [
      { key: 'name', label: 'Name', type: 'text' },
      { key: 'status', label: 'Status', type: 'status' },
    ],
    rows: Array.from({ length: count }, (_, index) => ({
      name: { text: `Employee ${index}`, sort: `Employee ${index}` },
      status: { text: index % 2 ? 'Present' : 'Absent', sort: index % 2 ? 'Present' : 'Absent' },
    })),
    totalCount: count,
  };
}

describe('ListViewer', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [ListViewer] });
  });

  it('renders nothing until a list is opened', () => {
    const fixture = TestBed.createComponent(ListViewer);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sheet')).toBeNull();
  });

  it('renders every row of a long list and filters by search', () => {
    const fixture = TestBed.createComponent(ListViewer);
    TestBed.inject(ListViewerService).open(bigList(600));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(600);
    expect(fixture.nativeElement.querySelector('.export-label').textContent).toContain('Download all (600)');

    const search: HTMLInputElement = fixture.nativeElement.querySelector('.search');
    search.value = 'Employee 59';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // "Employee 59", "Employee 590" to "Employee 599": eleven matches.
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(11);
    expect(fixture.nativeElement.querySelector('.export-label').textContent).toContain('Download filtered (11)');
  });

  it('closes when the service is cleared (Esc and backdrop call the same close)', () => {
    const service = TestBed.inject(ListViewerService);
    const fixture = TestBed.createComponent(ListViewer);
    service.open(bigList(3));
    fixture.detectChanges();

    service.close();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.sheet')).toBeNull();
  });
});
