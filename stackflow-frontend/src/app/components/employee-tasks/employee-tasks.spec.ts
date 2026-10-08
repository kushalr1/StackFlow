import { taskAlert } from './employee-tasks';

describe('personal task deadlines', () => {
  it('alerts only pending due-today or overdue tasks', () => {
    const task = { id: 1, title: 'Work', period: 'Daily', dueDate: '2026-10-06', isCompleted: false };
    expect(taskAlert(task, '2026-10-06')).toBe('Due today');
    expect(taskAlert(task, '2026-10-07')).toBe('Overdue');
    expect(taskAlert(task, '2026-10-05')).toBe('Due tomorrow');
    expect(taskAlert(task, '2026-10-04')).toBe('');
    expect(taskAlert({ ...task, isCompleted: true }, '2026-10-07')).toBe('');
  });
});
