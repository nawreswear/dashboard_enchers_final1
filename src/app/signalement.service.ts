import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './_service/user';
export interface Signalement {
  id: number;
  message: string;
  date: Date;
  user: User;
  users: User[];
  type: string;
}
@Injectable({
  providedIn: 'root'
})
export class SignalementService {

  private baseUrl = 'http://localhost:3007'; 

  constructor(private http: HttpClient) { }

  getSignalementById(id: number): Observable<Signalement> {
  
    return this.http.get<Signalement>(`${this.baseUrl}/${id}`);
  }

  saveSignalemente(signalement: Signalement): Observable<Signalement> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<Signalement>(`${this.baseUrl}/savee`, signalement,httpOptions);
  }

  saveSignalement(signalement: Signalement): Observable<Signalement> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.post<Signalement>(`${this.baseUrl}/save`, signalement,httpOptions);
  }

  updateSignalement(id: number, signalement: Signalement): Observable<Signalement> {
    return this.http.put<Signalement>(`${this.baseUrl}/${id}`, signalement);
  }

  deleteSignalement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getAllSignalements(): Observable<Signalement[]> {
    return this.http.get<Signalement[]>(`${this.baseUrl}/signalements`);
  }
  getUserById(userId: number): Observable<User>{
    return this.http.get<User>(`http://localhost:3003/getUserById/${userId}`);
  }
}
