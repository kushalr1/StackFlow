import { TestBed } from '@angular/core/testing';
import { ListCard } from './list-card';
import { ListViewerService } from '../../services/list-viewer.service';
import { ChatList } from '../../models/chat';

const salaries: ChatList = {
  title: 'Salary list — technical',
  subtitle: 'Active employees',
  columns: [
    { key: 'name', label: 'Name', type: 'text' },
    { key: 'pay', label: 'Monthly salary', type: 'currency' },
    { key: 'status', label: 'Status', type: 'status' },
  ],
  rows: [
    { name: { text: 'Vivek', sort: 'Vivek' }, pay: { text: '₹45,000.00', sort: 45000 }, status: { text: 'Active', sort: 'Active' } },
    { name: { text: 'Arnav', sort: 'Arnav' }, pay: { text: '₹50,000.00', sort: 50000 }, status: { text: 'On leave', sort: 'On leave' } },
  ],
  totalCount: 2,
};

function render(list: ChatList) {
  const fixture = TestBed.createComponent(ListCard);
  fixture.componentRef.setInput('list', list);
  fixture.detectChanges();
  return fixture;
}

describe('ListCard', () => {
  beforeEach(() => TestBed.configureTestingModule({ imports: [ListCard] }));

  it('renders the title, the item count and a preview of the first rows', () => {
    const el: HTMLElement = render(salaries).nativeElement;

    expect(el.querySelector('.card-title')?.textContent).toContain('Salary list — technical');
    expect(el.querySelector('.card-count')?.textContent).toContain('2');
    expect(el.querySelectorAll('.preview-row').length).toBe(2);
    expect(el.querySelector('.preview-primary')?.textContent).toContain('Vivek');
  });

  it('opens the full-screen viewer with the list when clicked', () => {
    const fixture = render(salaries);
    const viewer = TestBed.inject(ListViewerService);

    (fixture.nativeElement.querySelector('button.card') as HTMLButtonElement).click();

    expect(viewer.current()).toEqual(salaries);
  });

  it('renders without a subtitle or status column when the payload omits them', () => {
    const bare: ChatList = { title: 'Bare', columns: [{ key: 'name', label: 'Name', type: 'text' }], rows: [{ name: { text: 'Solo', sort: 'Solo' } }], totalCount: 1 };

    const el: HTMLElement = render(bare).nativeElement;

    expect(el.querySelector('.card-subtitle')).toBeNull();
    expect(el.querySelector('.badge')).toBeNull();
    expect(el.querySelector('.preview-primary')?.textContent).toContain('Solo');
  });

  it('does not throw when a row is missing the primary column', () => {
    const broken: ChatList = { ...salaries, rows: [{}] as unknown as ChatList['rows'], totalCount: 1 };

    expect(() => render(broken)).not.toThrow();
  });

  it('shows the status badge with a tone derived from its text', () => {
    const el: HTMLElement = render(salaries).nativeElement;

    const badges = Array.from(el.querySelectorAll('.badge')) as HTMLElement[];
    expect(badges.map((badge) => badge.dataset['tone'])).toEqual(['good', 'warn']);
  });
});
