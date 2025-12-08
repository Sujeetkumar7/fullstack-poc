import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { balanceValidationForStocks } from '../../validators/balance-validator';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-investing-dialog-component',
  standalone: true,
  templateUrl: './investing-dialog-component.html',
  styleUrls: ['./investing-dialog-component.scss'],
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
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
        quantity: ['', [Validators.required, Validators.min(1)]],
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
        stockName: this.data.row.DispSym,
        userId: this.data.userId,
        transactionType,
        quantity: this.investingForm.value.quantity,
        amount: this.calculatedAmount,
        pricePerUnit: this.data.row.Ltp
      };
      this.dialogRef.close(payload);
    }
  }

  getUsername() {
    return this.data.userName ?? '';
  }

  onClose(): void {
    this.dialogRef.close();
  }
}