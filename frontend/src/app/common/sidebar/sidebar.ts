import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.scss'],
})
export class Sidebar {
  @Input() menuItems: { label: string; icon: string; route: string }[] = [];
  @Input() sidebarOpen: boolean = false;

  @Output() closeSidebar = new EventEmitter<void>();

  onItemClick() {
    if (window.innerWidth <= 768) {
      this.closeSidebar.emit();
    }
  }
}
