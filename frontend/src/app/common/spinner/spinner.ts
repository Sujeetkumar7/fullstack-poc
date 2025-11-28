import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-spinner',
  templateUrl: './spinner.html',
  imports: [MatProgressSpinnerModule, CommonModule],
  styleUrls: ['./spinner.scss'],
})
export class Spinner {
  @Input() size: number = 40;
  @Input() color: string = '#1976d2';
}
