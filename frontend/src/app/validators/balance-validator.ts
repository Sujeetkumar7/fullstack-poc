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

export function balanceValidationForStocks(balance: number, pricePerUnit: number) {
  return (control: AbstractControl): ValidationErrors | null => {
    const quantity = control.get('quantity')?.value;
    const amount = quantity * pricePerUnit;

    if (quantity && amount > balance) {
      return { insufficientBalance: true };
    }
    return null;
  };
}
