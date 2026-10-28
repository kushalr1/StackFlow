import { startingChipsFor, welcomeMessage } from './chat-widget';

describe('startingChipsFor', () => {
  it('offers company-wide topics to admins', () => {
    const chips = startingChipsFor('Admin');
    expect(chips).toContain('Salary stats');
    expect(chips).not.toContain('My salary');
  });

  it('offers self-service topics to employees', () => {
    const chips = startingChipsFor('Employee');
    expect(chips).toContain('My salary');
    expect(chips).not.toContain('Salary stats');
  });
});

describe('welcomeMessage', () => {
  it('introduces the assistant', () => {
    expect(welcomeMessage).toBe("Hi! I'm the StackFlow assistant. How may I help you today?");
  });
});
