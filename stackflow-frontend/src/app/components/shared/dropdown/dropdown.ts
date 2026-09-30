import { ChangeDetectionStrategy, Component, EventEmitter, forwardRef, HostListener, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface DropdownOption {
  value: string | number;
  label: string;
}

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => Dropdown),
    multi: true,
  }],
})
export class Dropdown implements ControlValueAccessor {
  @Input() options: DropdownOption[] = [];
  @Input() placeholder = 'Select an option';
  @Input() ariaLabel = 'Select an option';
  @Output() readonly valueChange = new EventEmitter<string | number>();

  protected isOpen = false;
  protected currentValue: string | number = '';
  protected isDisabled = false;

  @Input()
  set value(value: string | number | null | undefined) {
    this.currentValue = value ?? '';
  }

  protected get selectedLabel(): string {
    return this.options.find(option => option.value === this.currentValue)?.label ?? this.placeholder;
  }

  protected toggle(event: MouseEvent): void {
    event.stopPropagation();
    if (!this.isDisabled) this.isOpen = !this.isOpen;
  }

  protected select(option: DropdownOption, event: MouseEvent): void {
    event.stopPropagation();
    this.currentValue = option.value;
    this.isOpen = false;
    this.onChange(option.value);
    this.onTouched();
    this.valueChange.emit(option.value);
  }

  writeValue(value: string | number | null): void {
    this.currentValue = value ?? '';
  }

  registerOnChange(callback: (value: string | number) => void): void {
    this.onChange = callback;
  }

  registerOnTouched(callback: () => void): void {
    this.onTouched = callback;
  }

  setDisabledState(disabled: boolean): void {
    this.isDisabled = disabled;
  }

  @HostListener('document:click')
  protected close(): void {
    this.isOpen = false;
  }

  @HostListener('document:keydown.escape')
  protected closeWithEscape(): void {
    this.isOpen = false;
  }

  private onChange: (value: string | number) => void = () => undefined;
  private onTouched: () => void = () => undefined;
}
