import { Component, computed, inject, input } from '@angular/core';
import { ChatList } from '../../models/chat';
import { itemCountLabel, statusTone } from '../../utils/list-format';
import { ListViewerService } from '../../services/list-viewer.service';

/** Compact card shown inside an assistant bubble. The whole card opens the full-screen viewer. */
@Component({
  selector: 'app-list-card',
  templateUrl: './list-card.html',
  styleUrl: './list-card.css',
})
export class ListCard {
  private readonly viewer = inject(ListViewerService);

  readonly list = input.required<ChatList>();

  protected readonly previewRows = computed(() => this.list().rows.slice(0, 3));
  protected readonly countLabel = computed(() => itemCountLabel(this.list()));
  protected readonly primary = computed(() => this.list().columns[0]);
  /** The first non-primary, non-status column, shown as the secondary line of each preview row. */
  protected readonly secondary = computed(() =>
    this.list().columns.find((column, index) => index > 0 && column.type !== 'status'),
  );
  protected readonly status = computed(() => this.list().columns.find((column) => column.type === 'status'));

  protected tone(value: string): string {
    return statusTone(value);
  }

  protected open(): void {
    this.viewer.open(this.list());
  }
}
