import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from "src/app/_service/user";

export interface Panier {
  id: number;
  totalP: number;
  date: Date;
  quantitecde: number;
  paiements: Paiement[];
  partEn: PartEn;
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
  prixinitial: number;
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
  private apiURL2 = "http://localhost:3004/lignepanier";
  private apiURL = "http://localhost:3004/panier";
  httpOptions = {
  headers: new HttpHeaders({
  'Content-Type': 'application/json'
  })
  }
constructor(private httpClient: HttpClient) { }
addPanier(panier: Panier): Observable<Panier> {
  return this.httpClient.post<Panier>(`${this.apiURL}/addPanier`, panier, this.httpOptions);
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
  return this.httpClient.delete<string>(`${this.apiURL}/deletePanier/${id}`);
}

calculerMontantTotal(): Observable<number> {
  return this.httpClient.get<number>(`${this.apiURL}/calculerMontantTotal`);
}
getLignePanierById(id: number): Observable<any> {
    return this.httpClient.get<any>(`${this.apiURL2}/getLignePanierById/${id}`);
  }
}