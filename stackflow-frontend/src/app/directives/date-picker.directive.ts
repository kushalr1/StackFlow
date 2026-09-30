import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: 'input[appDatePicker]',
  standalone: true,
})
export class DatePickerDirective {
  private readonly element = inject<ElementRef<HTMLInputElement>>(ElementRef);

  @HostListener('click')
  protected openPicker(): void {
    this.element.nativeElement.showPicker?.();
  }
}
