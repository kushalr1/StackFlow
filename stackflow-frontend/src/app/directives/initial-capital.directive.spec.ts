import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { InitialCapitalDirective } from './initial-capital.directive';

@Component({ imports: [FormsModule, InitialCapitalDirective], template: '<textarea appInitialCapital [(ngModel)]="text"></textarea><input type="email">' })
class Host { text = ''; }
describe('InitialCapitalDirective', () => {
  it('synchronizes ngModel immediately without capitalizing edits, paste or IME', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges(); await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;
    input.dispatchEvent(new InputEvent('beforeinput', { data: 'w', inputType: 'insertText', bubbles: true, cancelable: true }));
    expect(input.value).toBe('W');
    await fixture.whenStable(); expect(fixture.componentInstance.text).toBe('W');
    expect(input.selectionStart).toBe(1);
    input.value = 'Work'; input.setSelectionRange(0, 1);
    const replace = new InputEvent('beforeinput', { data: 'w', inputType: 'insertText', cancelable: true });
    input.dispatchEvent(replace); expect(replace.defaultPrevented).toBe(false);
    input.value = '';
    for (const event of [
      new InputEvent('beforeinput', { data: 'lowercase', inputType: 'insertFromPaste', cancelable: true }),
      new InputEvent('beforeinput', { data: 'a', inputType: 'insertText', isComposing: true, cancelable: true }),
    ]) { input.dispatchEvent(event); expect(event.defaultPrevented).toBe(false); }
    const email = fixture.nativeElement.querySelector('input');
    const event = new InputEvent('beforeinput', { data: 'a', inputType: 'insertText', cancelable: true });
    email.dispatchEvent(event); expect(event.defaultPrevented).toBe(false);
    fixture.destroy();
  });
});
