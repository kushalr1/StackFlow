import { TestBed } from '@angular/core/testing';
import { Dropdown } from './dropdown';

describe('Dropdown viewport sizing', () => {
  it('limits menu height below the visible trigger', () => {
    const fixture = TestBed.createComponent(Dropdown);
    fixture.componentRef.setInput('options', [{ value: 1, label: 'Employee' }]);
    fixture.detectChanges();
    const trigger = fixture.nativeElement.querySelector('button');
    trigger.getBoundingClientRect = () => ({ bottom: window.innerHeight - 116 });
    trigger.click(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.menu').style.maxHeight).toBe('100px');
    fixture.destroy();
  });
});
