import { ChangeDetectorRef, Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Table } from '../../common/table/table';
import { Dialog } from '../../common/dialog/dialog';
import { AdminLayout } from '../admin-layout/admin-layout';

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
    AdminLayout,
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
  @ViewChild('deleteUserTemplate') deleteUserTemplate!: TemplateRef<any>;
  userForm!: FormGroup;
  editMode = false;
  editUserId: number | null = null;
  activeTab = 'users';

  title = 'Admin Dashboard';
  username = 'AdminUser';

  constructor(private dialog: MatDialog, private fb: FormBuilder, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
    });
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const nextId = Math.max(...this.users.map((u) => u.id)) + 1;
        const newUser: User = {
          id: nextId,
          username: this.userForm.value.username,
        };

        this.users = [...this.users, newUser];
        this.cdr.detectChanges();
        this.userForm.reset();
      }
    });
  }

  onEditUser(user: User) {
    this.editMode = true;
    this.editUserId = user.id;

    this.userForm.patchValue({ username: user.username });

    const dialogRef = this.dialog.open(Dialog, {
      width: '400px',
      disableClose: true,
      autoFocus: false,
      data: {
        title: 'Edit User',
        confirmText: 'Update',
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

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const index = this.users.findIndex((u) => u.id === this.editUserId);
        if (index !== -1) {
          this.users[index].username = this.userForm.value.username;
          this.users = [...this.users];
          this.cdr.detectChanges();
        }
        this.editMode = false;
        this.editUserId = null;
        this.userForm.reset();
      }
    });
  }

  confirmDelete(user: User) {
    const dialogRef = this.dialog.open(Dialog, {
      width: '400px',
      disableClose: true,
      autoFocus: false,
      data: {
        title: 'Delete User',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        contentTemplate: this.deleteUserTemplate,
        templateContext: { $implicit: user },
        isFormValid: () => true,
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.users = this.users.filter((u) => u.id !== user.id);
        this.cdr.detectChanges();
      }
    });
  }
}
