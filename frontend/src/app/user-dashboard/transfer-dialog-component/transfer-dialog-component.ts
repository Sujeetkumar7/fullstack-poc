import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { UserResponse } from '../../services/user-service/user'


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
    @Inject(MAT_DIALOG_DATA) public data: { users: UserResponse[], loggedInUser: string}
  ) {
    this.filteredUsers = data.users.filter(user=> user.username !== data.loggedInUser);
    this.transferForm = this.fb.group({
      userId: [data.loggedInUser, Validators.required],
      username: ['', Validators.required],
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
