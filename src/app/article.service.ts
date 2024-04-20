import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Panier } from './shopping-cart/cards/panier.service';
import { NumberFormatStyle } from '@angular/common';
interface Article {
  id: number; // Assurez-vous que le type correspond à votre base de données
  titre: string;
  description: string;
  photo: string;
  prix:string;
  prixvente?: number;
  livrable:boolean;
  statut:string;
  quantiter:number;
  vendeur: { id: number };
  categorie: Categorie;
}
interface Categorie {
  id: number; 
  titre: string;
  description: string;
  image: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {
  private baseUrl = 'http://localhost:3002/article'; 

  constructor(private http: HttpClient) { }
  private baseUrl2 = 'http://localhost:3004/panier'; 
  getAllCategories(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`http://localhost:3002/categorie/getallcategories`);
  }
  getCategoryById(id: string): Observable<Categorie> {
    return this.http.get<Categorie>(`http://localhost:3002/categorie/getcategorieById/${id}`);
  }
  getAllArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`http://localhost:3002/article/getAll`);
  }
  findUserIdByNom(nomuser: string): Observable<number> {
    return this.http.get<number>(`http://localhost:3003/api/${nomuser}`).pipe(
      catchError(error => {
        let errorMessage = 'Une erreur s\'est produite lors de la recherche de l\'utilisateur.';
        if (error.status === 404) {
          errorMessage = `Utilisateur non trouvé avec le nom : ${nomuser}`;
        }
        console.error(errorMessage);
        return throwError(errorMessage);
      })
    );
  }
  getArticleById(id: number): Observable<Article> {
    return this.http.get<Article>(`${this.baseUrl}/${id}`);
  }
addArticle(data: Article): Observable<Article> {
    return this.http.post<Article>(`${this.baseUrl}/addArticle`, data); 
}

addArticleWithVendeurId(data: Article, vendeurId: number): Observable<Article> {
      return this.http.post<Article>(`${this.baseUrl}/addArticlee/${vendeurId}`, data);
}
  
updateArticle(id: string, data: Article): Observable<Article> {
  return this.http.put<Article>(`${this.baseUrl}/UpdateArticle/${id}`, data);
}

updateArticleStatut(id: number, statut: string): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/updateStatut/${id}`, { statut });
  }

  deleteArticle(id: string): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/deleteArticle/${id}`);
  }
  updateArticleForVendeur(vendeurId: number, articleId: number, newArticle: Article): Observable<Article> {
    const url = `${this.baseUrl}/articles/${vendeurId}/${articleId}`;
    return this.http.put<Article>(url, newArticle);
  }
  getAvailableArticles(): Observable<Article[]> {
    return this.http.get<Article[]>(`${this.baseUrl}/available`);
  }
  getUserIdByName(userName: string): Observable<number> {
    return this.http.get<number>(`http://localhost:3003/api/${userName}`);
  }

  addArticleToCart(article: Article, quantitecde: number): Observable<any> {
    const url = `${this.baseUrl2}/addToCart`;
    const httpOptions = {
      headers: new HttpHeaders({
      'Content-Type': 'application/json'
      })
      }
    return this.http.post<any>(url, { article, quantitecde }).pipe(
      catchError(error => {
        console.error('Une erreur s\'est produite lors de l\'ajout de l\'article au panier:', error);
        return throwError(error);
      })
    );
  }
  ajouterArticleAuPanier(panierId: number, articleId: number): Observable<Panier> {
    return this.http.post<Panier>(`http://localhost:3002/articles/${panierId}/ajouter-article`, articleId);
  }
  supprimerArticleDuPanier(panierId: number, articleId: number): Observable<Panier> {
    return this.http.delete<Panier>(`http://localhost:3002/articles/${panierId}/supprimer-article`, { body: articleId });
  }

  addPrixVenteForArticle(enchereId: number, articleId: number, prixvente: number): Observable<any> {
    const url = `${this.baseUrl}/updateArticlePrice/${enchereId}/${articleId}`;
    return this.http.put<any>(url, { prixvente });
  }
  
 
}
