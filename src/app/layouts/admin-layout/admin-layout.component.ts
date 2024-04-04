import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/_service/auth.service';


import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css'],
})
export class AdminLayoutComponent {
 /* avatarMenu: boolean = false;
  sideMenu: boolean = false;
  userData: User | null = null;

  constructor(
    private authenticationService: AuthService,
    private toastrService: ToastrService,
    private router: Router
  ) {
    this.authenticationService.userDataObs$.subscribe({
      next: (value) => {
        this.userData = value;
      },
    });
    this.router.events.subscribe((path: any) => {
      this.sideMenu = false;
    });
  }

  doLogOut() {
    this.authenticationService.logout();
    this.toastrService.info('Loged out Successfully', 'Sign Out');
  }

  toggleAvatarMenu(): void {
    this.avatarMenu = !this.avatarMenu;
  }

  toggleSideMenu(): void {
    this.sideMenu = !this.sideMenu;
    console.log('this.sideMenu: ', this.sideMenu);
  }*/
}
