import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../../services/authentication.service';
import { User } from 'src/app/interfaces/user';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/_service/auth.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent {
  searchValue: string | null = null;
  menuOpened: boolean = false;
  currentPath: string | null = '';
  userData: User | null = null;
  userMenu: boolean = false;

  constructor(
    private router: Router,
    private authenticationService: AuthService,
    private toastrService: ToastrService
  ) {
    this.router.events.subscribe((path: any) => {
      this.currentPath = path?.routerEvent?.url;
      this.menuOpened = false;
    });
    this.authenticationService.userDataObs$.subscribe({
      next: (value) => {
        this.userData = value;
      },
    });
  }

  toggleMenu() {
    this.menuOpened = !this.menuOpened;
  }

  isLoginOrSignup(): boolean {
    return this.currentPath === '/register' || this.currentPath === '/login';
  }

  isLoggedIn() {
    return this.authenticationService.isLoggedIn();
  }

  toggleUserMenu() {
    this.userMenu = !this.userMenu;
  }

  doLogOut() {
    this.authenticationService.logout();
    this.toastrService.info('Loged out Successfully', 'Sign Out');
  }
}
