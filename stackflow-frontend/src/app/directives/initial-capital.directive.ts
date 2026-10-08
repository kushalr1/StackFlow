import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({ selector: 'input[appInitialCapital], textarea[appInitialCapital]' })
export class InitialCapitalDirective {
  private readonly element = inject<ElementRef<HTMLInputElement | HTMLTextAreaElement>>(ElementRef);

  @HostListener('beforeinput', ['$event'])
  capitalizeInitial(rawEvent: Event): void {
    const event = rawEvent as InputEvent;
    const input = this.element.nativeElement;
    // Transform only typed initial text. Replacements, paste and IME preserve user intent.
    if (!event.cancelable || event.isComposing || event.inputType !== 'insertText' || !event.data || input.value.trim()) return;
    if (input.selectionStart !== input.selectionEnd) return;
    const capitalized = event.data.replace(/^(\s*)(\p{L})/u, (_, spaces: string, letter: string) => spaces + letter.toUpperCase());
    if (capitalized === event.data) return;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? start;
    if (input.maxLength >= 0 && input.value.length - (end - start) + capitalized.length > input.maxLength) return;
    event.preventDefault();
    input.setRangeText(capitalized, start, end, 'end');
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
