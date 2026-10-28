import { ChatList } from '../models/chat';

/** Colour family for a status badge. Unknown statuses fall back to neutral. */
export function statusTone(status: string): 'good' | 'warn' | 'bad' | 'neutral' {
  const value = status.toLowerCase();
  if (['approved', 'active', 'done', 'present', 'completed'].includes(value)) return 'good';
  if (['pending', 'planned', 'late', 'halfday', 'half day', 'onleave', 'on leave'].includes(value)) return 'warn';
  if (['rejected', 'absent', 'onhold', 'on hold', 'relieved'].includes(value)) return 'bad';
  return 'neutral';
}

/** Number of rows the list holds, which can be fewer than totalCount when the server capped it. */
export function itemCountLabel(list: ChatList): string {
  return list.totalCount === 1 ? '1 item' : `${list.totalCount} items`;
}
