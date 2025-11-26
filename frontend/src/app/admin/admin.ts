import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Table } from '../common/table/table';
import { Dialog } from '../common/dialog/dialog';

interface User {
  id: number;
  username: string;
}

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatCardModule,
    MatToolbarModule,
    MatFormFieldModule,
    MatInputModule,
    Table,
  ],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
})
export class Admin implements OnInit {
  users: User[] = [
    { id: 1, username: 'John' },
    { id: 2, username: 'Alice' },
    { id: 3, username: 'Bob' },
    { id: 4, username: 'User4' },
    { id: 5, username: 'User5' },
    { id: 6, username: 'User6' },
    { id: 7, username: 'User7' },
  ];

  @ViewChild('addUserTemplate') addUserTemplate!: TemplateRef<any>;
  userForm!: FormGroup;
  editMode = false;
  editUserId: number | null = null;

  constructor(private router: Router, private dialog: MatDialog, private fb: FormBuilder) {}

  ngOnInit() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  logout() {
    this.router.navigate(['/']);
  }

  openAddUser() {
    const dialogRef = this.dialog.open(Dialog, {
      width: '400px',
      disableClose: true,
      autoFocus: false,
      data: {
        title: 'Add User',
        confirmText: 'Save',
        cancelText: 'Cancel',
        contentTemplate: this.addUserTemplate,
        isFormValid: () => this.userForm.valid,
        resetForm: () => {
          this.userForm.reset();
          this.userForm.markAsPristine();
          this.userForm.markAsUntouched();
        },
      },
    });
  }
}
