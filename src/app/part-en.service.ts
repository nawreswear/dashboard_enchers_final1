import { Injectable } from '@angular/core';
import { User } from './_service/user';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
export interface Part_En {
  id: number;
  encheres: Enchere[];
  users: User[];
}
interface Enchere {
  id?: number;
  dateDebut: string;
  dateFin: string;
  parten: { id: number };
  admin: { id: number };
  articles: { id: number }[];
}
@Injectable({
  providedIn: 'root'
})
export class PartEnService {
  private baseUrl = 'http://localhost:3002/parten';
  
    constructor(private http: HttpClient) { }
  
    getAllPart_En(): Observable<Part_En[]> {
      return this.http.get<Part_En[]>(`${this.baseUrl}/all`);
    }
  
    getPart_EnById(id: number): Observable<Part_En> {
      return this.http.get<Part_En>(`${this.baseUrl}/${id}`);
    }
  
    addPart_En(partEn: Part_En): Observable<Part_En> {
      return this.http.post<Part_En>(`${this.baseUrl}/add`, partEn);
    }
  
    updatePart_En(partEn: Part_En): Observable<Part_En> {
      return this.http.put<Part_En>(`${this.baseUrl}/update`, partEn);
    }
  
    deletePart_En(id: number): Observable<any> {
      return this.http.delete(`${this.baseUrl}/delete/${id}`, { responseType: 'text' });
    }
    getPartenIdByEnchere(enchereId: number): Observable<number> {
      return this.http.get<number>(`${this.baseUrl}/getPartenIdByEnchere/${enchereId}`);
    }
    getPartenIdByUserId(userId: number): Observable<number> {
      return this.http.get<number>(`${this.baseUrl}/${userId}/parten-id`);
    }
  }