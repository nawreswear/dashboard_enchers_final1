import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paiement } from './panier.service';

@Injectable({
providedIn: 'root'
})

export class PaiementService {
private apiURL = "http://localhost:3004/paiements";
 httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})}

constructor(private httpClient: HttpClient) { }

    sendPayment(data:any): Observable<any> {
    return this.httpClient.post(this.apiURL + '/addPaiement/',
    JSON.stringify(data),this.httpOptions)
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
        return this.httpClient.delete<string>(`${this.apiURL}/deletePaiement/${id}`);
      }
    }