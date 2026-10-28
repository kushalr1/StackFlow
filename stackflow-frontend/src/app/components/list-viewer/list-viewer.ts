import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { ChatCell, ChatListColumn, ChatListRow } from '../../models/chat';
import { itemCountLabel, statusTone } from '../../utils/list-format';
import { ListViewerService } from '../../services/list-viewer.service';
import { downloadCsv, downloadXlsx } from '../../services/list-export';

type SortDirection = 'asc' | 'desc';

/**
 * Full-screen table for any list card. Mounted once in the app shell, so the same viewer serves
 * the admin and employee panels. Export uses the rows currently shown (after search).
 */
@Component({
  selector: 'app-list-viewer',
  templateUrl: './list-viewer.html',
  styleUrl: './list-viewer.css',
})
export class ListViewer {
  protected readonly viewer = inject(ListViewerService);

  protected readonly query = signal('');
  protected readonly sortKey = signal<string | null>(null);
  protected readonly sortDirection = signal<SortDirection>('asc');
  protected readonly exporting = signal(false);

  protected readonly countLabel = computed(() => {
    const list = this.viewer.current();
    return list ? itemCountLabel(list) : '';
  });

  /** Rows matching the search, in the current sort order. */
  protected readonly visibleRows = computed<ChatListRow[]>(() => {
    const list = this.viewer.current();
    if (!list) return [];

    const needle = this.query().trim().toLowerCase();
    const matching = needle
      ? list.rows.filter((row) => list.columns.some((column) => (row[column.key]?.text ?? '').toLowerCase().includes(needle)))
      : list.rows;

    const key = this.sortKey();
    if (!key) return matching;

    const direction = this.sortDirection() === 'asc' ? 1 : -1;
    return [...matching].sort((a, b) => direction * compareCells(a[key], b[key]));
  });

  protected readonly filtered = computed(() => this.query().trim().length > 0);
  protected readonly exportLabel = computed(() =>
    this.filtered() ? `Download filtered (${this.visibleRows().length})` : `Download all (${this.viewer.current()?.rows.length ?? 0})`,
  );

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close();
  }

  protected close(): void {
    this.viewer.close();
    this.query.set('');
    this.sortKey.set(null);
    this.sortDirection.set('asc');
  }

  protected onBackdropClick(event: MouseEvent): void {
    // Only the dimmed backdrop closes the viewer; clicks inside the sheet do not.
    if (event.target === event.currentTarget) {
      this.close();
    }
  }

  protected sort(column: ChatListColumn): void {
    if (this.sortKey() === column.key) {
      this.sortDirection.update((direction) => (direction === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(column.key);
      this.sortDirection.set('asc');
    }
  }

  protected ariaSort(column: ChatListColumn): string {
    if (this.sortKey() !== column.key) return 'none';
    return this.sortDirection() === 'asc' ? 'ascending' : 'descending';
  }

  protected tone(value: string): string {
    return statusTone(value);
  }

  protected csv(): void {
    const list = this.viewer.current();
    if (list) downloadCsv(list, this.visibleRows());
  }

  protected async excel(): Promise<void> {
    const list = this.viewer.current();
    if (!list) return;
    this.exporting.set(true);
    try {
      await downloadXlsx(list, this.visibleRows());
    } finally {
      this.exporting.set(false);
    }
  }
}

function compareCells(a: ChatCell | undefined, b: ChatCell | undefined): number {
  const left = a?.sort ?? a?.text ?? '';
  const right = b?.sort ?? b?.text ?? '';
  if (typeof left === 'number' && typeof right === 'number') return left - right;
  return String(left).localeCompare(String(right), undefined, { numeric: true, sensitivity: 'base' });
}
