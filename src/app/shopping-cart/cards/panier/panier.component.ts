import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Panier, PanierService, PartEn } from '../panier.service';
import { ArticleService } from 'src/app/article.service';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { User } from 'src/app/_service/user';
import { EnchersServiceService } from 'src/app/enchers-service.service';
import { PartEnService } from 'src/app/part-en.service';

@Component({
  selector: 'app-panier',
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.css']
})
export class PanierComponent implements OnInit {
  @Input() panier: Panier = {} as Panier;
  idRequis: number;
  userId: number | null = null;
  panierDetails: any[] = [];
 // userId$: Observable<User | null> = this.getUserIdObservable();
  token = new BehaviorSubject<string | null>(null);
  tokenObs$ = this.token.asObservable();
  collapsed: boolean = true;
  parten: any | null = null;
 public panierItems: any[] = [];
  constructor(public panierService: PanierService, private articleService: ArticleService,
    private encherService :  EnchersServiceService, private  partEnService : PartEnService,
    private router: Router) { 
    this.idRequis = 0; 
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      if (tokenPayload.sub) {
        const username = tokenPayload.sub;
        console.log('Nom utilisateur :', username);
      }
      this.token.next(storedToken);
    }
    this.tokenObs$.subscribe({
      next: (token) => {
        if (!token) router.navigate(['/']);
      },
    });
  }

  ajouterArticle(article: any) {
    this.panierItems.push(article);
  }

  // Supprimer un article du panier
  supprimerArticle(index: number) {
    this.panierItems.splice(index, 1);
  }
  addToCart(article: any) {
    // Incrémentez la quantité à chaque clic sur "Add to Cart"
    if (!article.quantiter) {
        article.quantiter = 1; // Si la quantité n'est pas définie, initialisez-la à 1
    } else {
        article.quantiter++; // Incrémentez la quantité
    }

    // Récupérer l'ID de l'utilisateur
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
        if (tokenPayload.sub) {
            const username = tokenPayload.sub;
            this.encherService.findUserIdByNom(username).subscribe(
                userId => {
                    console.log('ID de l\'utilisateur trouvé :', userId);
                    // Maintenant, vous avez l'ID de l'utilisateur, vous pouvez récupérer le partenaire ID
                    this.partEnService.getPartenIdByUserId(userId).subscribe(
                        partenId => {
                            console.log('ID du partenaire trouvé :', partenId);
                            // Appelez votre service pour créer un nouveau panier
                            this.panierService.addPanier(partenId).subscribe(
                                (panierId: number) => {
                                    // Appelez votre service pour ajouter l'article au panier avec la quantité mise à jour
                                    this.panierService.addToCart(article.id, panierId, partenId).subscribe(
                                        (response) => { // Gérer la réponse du service si nécessaire
                                            console.log("Article ajouté au panier avec succès :", response);
                                            article.quantiter++; 
                                        },
                                        (error) => { // Gérer l'erreur si nécessaire
                                            console.error("Erreur lors de l'ajout de l'article au panier :", error);
                                        }
                                    );
                                },
                                (error) => {
                                    console.error("Erreur lors de la création du panier :", error);
                                }
                            );
                        },
                        error => {
                            console.error('Erreur lors de la récupération de l\'ID du partenaire :', error);
                        }
                    );
                },
                error => {
                    console.error('Erreur lors de la récupération de l\'ID de l\'utilisateur :', error);
                }
            );
        }
    }
}


  // Calculer le total du panier
  public calculerTotal(): number {
    let total = 0;
    for (const item of this.panierItems) {
      total += item.prix;
    }
    return total;
  }
  @Input() ArticleAdded: any;

  ngOnInit() {
    this.getPartenIdByUserId();
 }
 
 getPanierDetails(partenId: number): void {
     this.panierService.getPanierAvecIdPartenaire(partenId).subscribe(
       (paniers: Panier[]) => {
         if (paniers) {
           console.log("Paniers récupérés :", paniers);
           this.panierDetails = paniers; // Assignez les paniers récupérés à la variable panierDetails
         } else {
           console.error("Aucun panier trouvé pour le partenaire avec l'ID :", partenId);
         }
       },
       (error: any) => {
         console.error("Erreur lors de la récupération des paniers :", error);
       }
     );
 }
 
 showCartModal: boolean = false;
 
 getPartenIdByUserId() {
   const storedToken = localStorage.getItem('token');
   if (storedToken) {
     const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
     if (tokenPayload.sub) {
       const username = tokenPayload.sub;
       this.encherService.findUserIdByNom(username).subscribe(
         userId => {
           console.log('ID de l\'utilisateur trouvé :', userId);
           // Maintenant, vous avez l'ID de l'utilisateur, vous pouvez récupérer le partenaire ID
           this.partEnService.getPartenIdByUserId(userId).subscribe(
             partenId => {
               console.log('ID du partenaire trouvé :', partenId);
               // Une fois que vous avez récupéré l'ID du partenaire, vous pouvez appeler la méthode pour récupérer le panier avec cet ID
               this.getPanierDetails(partenId);
             },
             error => {
               console.error('Erreur lors de la récupération de l\'ID du partenaire :', error);
             }
           );
         },
         error => {
           console.error('Erreur lors de la récupération de l\'ID de l\'utilisateur :', error);
         }
       );
     }
   }
 }
 
 getUserIdObservable(): Observable<User | null> {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      if (tokenPayload.sub) {
        const username = tokenPayload.sub;
        return this.articleService.findUserIdByNom(username).pipe(
          map(userId => userId ? { id: +userId } as unknown as User : null)
        );
      }
    }
    return of(null);
  }

  openPDF() {
    let Data: any = document.getElementById('htmlData');
    html2canvas(Data).then((canvas) => {
      let fileWidth = 100;
      let fileHeight = (canvas.height * fileWidth) / canvas.width;
      const FILEURI = canvas.toDataURL('image/png');
      let PDF = new jsPDF('p', 'mm', 'a4');
      let position = 20;
      PDF.addImage(FILEURI, 'PNG', 50, position, fileWidth, fileHeight);
      PDF.save('cart.pdf');
    });
  }
 addToPanier(panierId: number, articleId: number) {
    this.articleService.ajouterArticleAuPanier(panierId, articleId).subscribe(
      (response) => {
        console.log('Article ajouté au panier avec succès :', response);
        // Traitez la réponse comme vous le souhaitez, par exemple mettre à jour l'affichage ou afficher un message de confirmation.
      },
      (error) => {
        console.error('Une erreur s\'est produite lors de l\'ajout de l\'article au panier :', error);
        // Traitez l'erreur comme vous le souhaitez, par exemple afficher un message d'erreur à l'utilisateur.
      }
    );
  }
  removeFromPanier(panierId: number, articleId: number) {
    this.articleService.supprimerArticleDuPanier(panierId, articleId).subscribe(
      (response) => {
        console.log('Article supprimé du panier avec succès :', response);
        
        // Après avoir supprimé l'article du panier, appeler deletePanier
        this.panierService.deletePanier(panierId).subscribe(
          (deleteResponse) => {
            console.log('Panier supprimé avec succès :', deleteResponse);
            // Traitez la réponse comme vous le souhaitez
          },
          (deleteError) => {
            console.error('Une erreur s\'est produite lors de la suppression du panier :', deleteError);
            // Traitez l'erreur comme vous le souhaitez
          }
        );
        
        // Traitez la réponse comme vous le souhaitez, par exemple mettre à jour l'affichage ou afficher un message de confirmation.
      },
      (error) => {
        console.error('Une erreur s\'est produite lors de la suppression de l\'article du panier :', error);
        // Traitez l'erreur comme vous le souhaitez, par exemple afficher un message d'erreur à l'utilisateur.
      }
    );
  }
  
}