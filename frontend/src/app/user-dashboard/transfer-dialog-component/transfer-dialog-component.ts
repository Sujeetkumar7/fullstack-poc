import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UserResponse } from '../../services/user-service/user'
import { balanceValidator } from '../../validators/balance-validator';


@Component({
  selector: 'app-transfer-dialog-component',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule],
  templateUrl: './transfer-dialog-component.html',
  styleUrls: ['./transfer-dialog-component.scss'],
})
export class TransferDialogComponent {
  transferForm!: FormGroup;
  filteredUsers: UserResponse[] =[]
  
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<TransferDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { users: UserResponse[], userId: string, balance: number}
  ) {
    console.log(data.userId);
    this.filteredUsers = data.users.filter(user=> user?.userId !== data?.userId);
    this.transferForm = this.fb.group({
    sourceUserId: [data?.userId, Validators.required],
    destinationUserId: ['', Validators.required],
    amount: [
      '',
        [
        Validators.required,
        Validators.min(1),
        balanceValidator(data.balance)
      ]
    ]
  });

  }

  getUsernameById(userId: string): string {
    const user = this.data.users.find(u => u.userId === userId);
    return user ? user.username : '';
  }

  submit(){
    if(this.transferForm.valid){
      this.dialogRef.close(this.transferForm.value);
    }
  }
  
}
