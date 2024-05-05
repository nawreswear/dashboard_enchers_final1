import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Panier } from './panier.service';

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
export class PaiementService {
  private apiURL = "http://localhost:3004/paiements";
  httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(private httpClient: HttpClient) { }

  passerAuPaiement(panier: Panier): Observable<Paiement> {
    return this.httpClient.post<Paiement>(`${this.apiURL}/checkout`, panier, this.httpOptions);
  }

  updatePaiementstatut(id: number): Observable<Paiement> {
    return this.httpClient.put<Paiement>(`${this.apiURL}/updatePaiementstatut/${id}`, null, this.httpOptions);
  }
  
  sendPayment(data: any): Observable<any> {
    return this.httpClient.post(`${this.apiURL}/paiement`, data, this.httpOptions);
  }
  viderPanierApresPaiement(paiementId: number): Observable<string> {
    return this.httpClient.delete<string>(`${this.apiURL}/viderPanier/${paiementId}`, this.httpOptions);
  }

  getAllPaiements(): Observable<Paiement[]> {
    return this.httpClient.get<Paiement[]>(`${this.apiURL}/getAllPaiements`);
  }

  getPaiementById(id: number): Observable<Paiement> {
    return this.httpClient.get<Paiement>(`${this.apiURL}/getPaiementById/${id}`);
  }

  updatePaiement(id: number, paiement: Paiement): Observable<Paiement> {
    return this.httpClient.put<Paiement>(`${this.apiURL}/updatePaiement/${id}`, paiement, this.httpOptions);
  }

  deletePaiement(id: number): Observable<string> {
    return this.httpClient.delete<string>(`${this.apiURL}/deletePaiement/${id}`, this.httpOptions);
  }
}
