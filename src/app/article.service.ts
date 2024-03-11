import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
interface Article {
  
  id: number; // Assurez-vous que le type correspond à votre base de données
  titre: string;
  description: string;
  photo: string;
  prix:string;
  Livrable:boolean;
  statut:string;
  quantite:number;
}
@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private baseUrl = 'http://localhost:3002/article'; 

  constructor(private http: HttpClient) { }

  getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.baseUrl}/getAll`);
  }

  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.baseUrl}/${id}`);
  }

  addArticle(data: Article): Observable<Article> {
    return this.http.post<Article>(`${this.baseUrl}/addArticle`, data); }


  updateArticle(id: string, data: Article): Observable<Article> {
    return this.http.put<Article>(`${this.baseUrl}/UpdateArticle/${id}`, data);
  }

  updateArticleStatut(id: number, statut: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/updateStatut/${id}`, { statut });
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/deleteArticle/${id}`);
  }

  getAvailableArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.baseUrl}/available`);
  }
}
