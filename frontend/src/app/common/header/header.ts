import {
  Component,
  EventEmitter,
  Input,
  Output,
  HostListener,
  ElementRef,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth-service/auth-service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.scss'],
})
export class Header {
  @Input() title: string = 'Admin Dashboard';
  @Input() username: string = '';
  @Output() toggleSidebar = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();

  role: string = '';
  menuOpen = false;

  constructor(
    private authService: AuthService,
    private eRef: ElementRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const userDetails = localStorage.getItem('userDetails');
      if (userDetails) {
        const parsed = JSON.parse(userDetails);
        this.username = parsed.username || 'User';
        this.role = parsed.userRole || '';
      }
    }
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  onToggleSidebar() {
    this.toggleSidebar.emit();
  }

  onLogout() {
    this.menuOpen = false;
    this.authService.logout();
    this.logout.emit();
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!this.eRef.nativeElement.contains(event.target)) {
      this.menuOpen = false;
    }
  }
}
