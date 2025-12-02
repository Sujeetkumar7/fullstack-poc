import { AbstractControl, ValidationErrors } from '@angular/forms';

export function balanceValidator(balance: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const enteredAmount = control.value;
    if (enteredAmount && enteredAmount > balance) {
      return { insufficientBalance: true };
    }
    return null;
  };
}