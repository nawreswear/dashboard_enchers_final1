import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from "src/app/_service/user";

export interface Panier {
  id: number;
  totalP: number;
  quantitecde: number;
  paiements: Paiement[];
  partEn:  { id: number };
  articles: Article[];
}
export interface PartEn {
  id: number;
  panier: Panier;
  users: User[];
}

export interface Article {
  id: number;
  titre: string;
  photo: string;
  description: string;
  quantiter: number;
  prix: number; 
  livrable: boolean;
  statut: string;
  prixvente: number;
  vendeur: { id: number };
  categorie: Categorie;
}


export interface Categorie {
  id: number; 
  titre: string;
  description: string;
  image: string;
}
export interface Paiement {
  id: number;
  montant: number;
  statut: string;
  date: Date;
  panier: Panier;
}
@Injectable({
providedIn: 'root'
})
export class PanierService {
  private apiURL = "http://localhost:3004/panier";
  httpOptions = {
  headers: new HttpHeaders({
  'Content-Type': 'application/json'
  })
  }
constructor(private httpClient: HttpClient) { }

addPanier(partenId: number): Observable<number> {
  return this.httpClient.post<number>(`http://localhost:3004/panier/addPanier/${partenId}`, {}, this.httpOptions);
}
containsArticle(panierId: number, articleId: number): Observable<boolean> {
  return this.httpClient.get<boolean>(`http://localhost:3004/panier/containsArticle/${panierId}/${articleId}`, this.httpOptions);
}
supprimerArticleDuPanier(panierId: number, articleId: number): Observable<any> {
  return this.httpClient.delete<any>(`http://localhost:3004/articles/${panierId}/supprimer-article/${articleId}`, this.httpOptions);
}
getPaniersByPartenaire(partenId: number): Observable<Panier[]> {
  return this.httpClient.get<Panier[]>(`http://localhost:3004/panier/${partenId}`);
}

addToCart(articleId: number, panierId: number, partenId: number): Observable<Panier> {

  return this.httpClient.post<Panier>(`http://localhost:3004/articles/${articleId}/${panierId}/${partenId}/ajouter-article`, {}, this.httpOptions);
}
getPanierAvecIdPartenaire(partenId: number): Observable<Panier[]> {
  return this.httpClient.get<any[]>(`http://localhost:3004/panier/partenaire/${partenId}`);
}

getAllPaniers(): Observable<Panier[]> {
  return this.httpClient.get<Panier[]>(`${this.apiURL}/getAllPaniers`);
}

getPanierById(id: number): Observable<Panier> {
  return this.httpClient.get<Panier>(`${this.apiURL}/getPanierById/${id}`);
}

updatePanier(id: number, panier: Panier): Observable<Panier> {
  return this.httpClient.put<Panier>(`${this.apiURL}/updatePanier/${id}`, panier, this.httpOptions);
}

deletePanier(id: number): Observable<string> {
  return this.httpClient.delete<string>(`${this.apiURL}/deletePanier/${id}`, this.httpOptions);
}

/* calculerMontantTotal(): Observable<number> {
  return this.httpClient.get<number>(`${this.apiURL}/calculerMontantTotal`);
}*/

}