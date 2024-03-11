import { Component } from '@angular/core';
import { AuthService } from '../_service/auth.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form: any = {
    email: '',
    //photo:'',
    password: '',
    type: 'user' // Définissez la valeur par défaut pour le champ "type"
  };
  
  isLoginFailed = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) { }
  ngOnInit(): void {
  }
 

 
  onSubmit() {
    this.authService.login(this.form).subscribe(
      data => {
        this.isLoginFailed = false;
        this.router.navigate(['/home']); // Rediriger vers la page du tableau de bord
      },
      err => {
        this.errorMessage = err.error.message;
        this.isLoginFailed = true;
      }
    );     
  }

  
  
  goToRegister(): void {
    this.router.navigate(['/register']); // Redirige vers la route '/register'
  }
  reloadPage(): void {
    window.location.reload();
  }
  
}
