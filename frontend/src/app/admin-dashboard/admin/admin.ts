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
import { UserService, UserResponse, UserRequest } from '../../services/user-service/user';
import { Spinner } from '../../common/spinner/spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
interface User {
  userId: string;
  username: string;
  currentBalance: number;
  userRole: string;
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
    Spinner,
    Table,
    MatSnackBarModule,
  ],
  templateUrl: './admin.html',
  styleUrls: ['./admin.scss'],
})
export class Admin implements OnInit {
  users: UserResponse[] = [];

  @ViewChild('addUserTemplate') addUserTemplate!: TemplateRef<any>;
  @ViewChild('deleteUserTemplate') deleteUserTemplate!: TemplateRef<any>;
  userForm!: FormGroup;
  editMode = false;
  editUserId: string | null = null;
  activeTab = 'users';

  title = 'Admin Dashboard';
  username = 'AdminUser';

  loading = false;

  tableColoumnNames: { [key: string]: string } = {
    userId: 'User ID',
    username: 'User Name',
    userRole: 'User Role',
    currentBalance: 'Current Balance',
  };

  constructor(
    private dialog: MatDialog,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.pattern(/^\S+$/)]],
      role: ['USER', Validators.required],
      currentBalance: [0],
    });
  }

  loadUsers() {
    this.loading = true;

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.users = data;
        console.log('API data loaded:', data);
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching users:', err);
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  openAddUser() {
    this.userForm.reset();
    this.userForm.get('username')?.enable();
    this.userForm.markAsPristine();
    this.userForm.markAsUntouched();

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
        onConfirm: () => this.handleAddUser(dialogRef),
      },
    });
  }

  handleAddUser(dialogRef: any) {
    this.loading = true;

    const requestBody: UserRequest = {
      username: this.userForm.value.username,
      userRole: this.userForm.value.role,
      currentBalance: this.userForm.value.currentBalance || 0,
    };

    this.userService.createUser(requestBody).subscribe({
      next: (response: UserResponse) => {
        const newUser = {
          ...response,
          userRole: this.userForm.value.role,
          currentBalance: this.userForm.value.currentBalance,
        };

        this.users = [...this.users, newUser];

        this.loading = false;
        this.cdr.detectChanges();

        this.userForm.reset();
        this.userForm.markAsPristine();
        this.userForm.markAsUntouched();

        dialogRef.close();

        this.snackBar.open('User added successfully!', '', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error('API failed:', err);
        this.loading = false;
        this.cdr.detectChanges();

        this.userForm.reset();
        this.userForm.markAsPristine();
        this.userForm.markAsUntouched();

        dialogRef.close();

        this.snackBar.open('Failed to add user!', '', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
    });
  }

  onEditUser(user: User) {
    this.editMode = true;
    this.editUserId = user.userId;

    this.userForm.patchValue({
      username: user.username,
      role: user.userRole,
      currentBalance: user.currentBalance || 0,
    });

    this.userForm.get('username')?.disable();

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
        isSubmitting: false,
        onConfirm: () => this.handleEditUser(dialogRef, user),
      },
    });
  }

  handleEditUser(dialogRef: any, user: User) {
    const raw = this.userForm.getRawValue();

    const updatedUser: UserResponse = {
      userId: user.userId,
      username: raw.username,
      currentBalance: raw.currentBalance || 0,
      userRole: raw.role,
    };

    this.userService.updateUser(updatedUser.userId, updatedUser).subscribe({
      next: (response) => {
        console.log(response);
        const index = this.users.findIndex((u) => u.userId === updatedUser.userId);
        if (index !== -1) {
          this.users[index] = updatedUser;
          this.users = [...this.users];
        }
        this.cdr.detectChanges();

        this.userForm.reset();
        this.userForm.markAsPristine();
        this.userForm.markAsUntouched();

        dialogRef.close();

        this.snackBar.open(`User ${updatedUser.username} updated successfully!`, '', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error('Update failed:', err);

        this.userForm.reset();
        this.userForm.markAsPristine();
        this.userForm.markAsUntouched();

        dialogRef.close();

        this.snackBar.open('Failed to update user!', '', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
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
        isSubmitting: false,
        onConfirm: () => this.handleDeleteUser(dialogRef, user),
      },
    });
  }

  handleDeleteUser(dialogRef: any, user: User) {
    this.userService.deleteUser(user.userId).subscribe({
      next: (response) => {
        console.log(response);
        this.users = this.users.filter((u) => u.userId !== user.userId);
        this.cdr.detectChanges();

        dialogRef.close();

        this.snackBar.open(`User ${user.username} deleted successfully!`, '', {
          duration: 3000,
          panelClass: ['success-snackbar'],
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
      error: (err) => {
        console.error('Delete failed:', err);

        dialogRef.close();

        this.snackBar.open('Failed to delete user!', '', {
          duration: 3000,
          panelClass: ['error-snackbar'],
          horizontalPosition: 'end',
          verticalPosition: 'top',
        });
      },
    });
  }
}
