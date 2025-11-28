import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { User } from '../../user-service';

@Component({
  selector: 'app-transfer-dialog-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './transfer-dialog-component.html',
  styleUrls: ['./transfer-dialog-component.scss'],
})
export class TransferDialogComponent {
  transferForm!: FormGroup;
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TransferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { users: User[], fromUser: string}
  ) {
    this.transferForm = this.fb.group({
      fromUser: [data.fromUser, Validators.required],
      toUser: ['', Validators.required],
      amount: ['', Validators.required],
      transactionType: ['debit', Validators.required]
    });
  }

  submit(){
    if(this.transferForm.valid){
      this.dialogRef.close(this.transferForm.value);
    }
  }
}
