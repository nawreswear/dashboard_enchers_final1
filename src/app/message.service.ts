import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from './_service/user';
export interface Message {
  id: number;
  message: string;
  date: Date;
  user: User;
  users: User[];
}
@Injectable({
  providedIn: 'root'
})
export class MessageService {

  private baseUrl = 'http://localhost:3007/'; // Remplacez par l'URL de votre serveur Spring

  constructor(private http: HttpClient) { }

  getMessages(): Observable<any> {
    return this.http.get(this.baseUrl + 'message');
  }

  getMessageById(id: number): Observable<any> {
    return this.http.get(this.baseUrl + 'messages/' + id);
  }

  createMessage(message: any): Observable<any> {
    return this.http.post(this.baseUrl + 'messages', message);
  }

  deleteMessage(id: number): Observable<any> {
    return this.http.delete(this.baseUrl + 'messages/' + id);
  }
}