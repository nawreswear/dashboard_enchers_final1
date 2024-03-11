import { Component } from '@angular/core';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'angular-ecommerce';

  /*constructor(private httpClient: HttpClient) {
    this.httpClient
      .get(`${API_URL}/category`)
      .subscribe({ next: (value) => console.log(value) });
  }*/
}
