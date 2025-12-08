import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { balanceValidationForStocks } from '../../validators/balance-validator';

@Component({
  selector: 'app-investing-dialog-component',
  standalone: true,
  templateUrl: './investing-dialog-component.html',
  styleUrls: ['./investing-dialog-component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class InvestingDialogComponent {
  investingForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<InvestingDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { row: any; userId: string; balance: number; userName: string }
  ) {
    this.investingForm = this.fb.group(
      {
        name: [data?.row?.DispSym, Validators.required],
        userId: [data?.userId, Validators.required],
        quantity: ['', [Validators.required, Validators.min(1)]],
        pricePerUnit: [data?.row?.Ltp ?? 0],
      },
      {
        validators: balanceValidationForStocks(data.balance, data?.row?.Ltp ?? 0),
      }
    );
  }



  get calculatedAmount(): number {
    const qty = this.investingForm.get('quantity')?.value || 0;
    const ltp = this.data?.row?.Ltp || 0;
    return qty * ltp;
  }

  submit(transactionType: 'buy' | 'sell') {
    if (this.investingForm.valid) {
      const payload = {
        ...this.investingForm.value,
        transactionType,
        amount: this.calculatedAmount,
      };
      this.dialogRef.close(payload);
    }
  }

  getUsername() {
    return this.data.userName ?? '';
  }
}