import { Component } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms'; // Importez FormBuilder si vous utilisez des formulaires réactifs

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular-ecommerce';
  userData: FormGroup; // Déclarez userData comme un FormGroup

  constructor(private formBuilder: FormBuilder) {
    this.userData = this.formBuilder.group({
      value: this.formBuilder.group({
        type: [''] // Initialisez le champ type avec une valeur par défaut vide
      })
    });
  }

  isAdmin(): boolean {
    // Vérifiez si userData.value et userData.value.type sont définis
    if (this.userData.value && this.userData.value.type) {
      // Vérifiez si le type contient 'admin'
      return this.userData.value.type.includes('admin');
    } else {
      return false; // Retournez false par défaut si userData ou userData.value.type ne sont pas définis
    }
  }
}
