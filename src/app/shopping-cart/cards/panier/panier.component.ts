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
  errorMessage: string = '';

  addToCart(article: any) {
    // Retrieve the user's ID
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
        if (tokenPayload.sub) {
            const username = tokenPayload.sub;
            // Find the user ID by username
            this.encherService.findUserIdByNom(username).subscribe(
                userId => {
                    console.log('User ID found:', userId);
                    // Once you have the user ID, retrieve the partner ID
                    this.partEnService.getPartenIdByUserId(userId).subscribe(
                        partnerId => {
                            console.log('Partner ID found:', partnerId);
                            // Call your service to get the carts associated with the partner
                            this.panierService.getPaniersByPartenaire(partnerId).subscribe(
                                (carts: any[]) => {
                                    // Check if carts exist
                                    if (carts && carts.length > 0) {
                                        // Select the first cart from the array
                                        const cart = carts[0];
                                        console.log(" article.quantiter", article.quantiter);
                                        
                                        // Check if the quantity in the cart does not exceed the available quantity
                                        if (cart.quantitecde < article.quantiter) {
                                          console.log("cart.quantitecd", cart.quantitecde);
                                            // Update the cart with the article's quantity and price
                                            cart.quantitecde++ || 0;
  
                                            // Initialize cart.totalP if it's null
                                            cart.totalP = cart.totalP || 0;
  
                                            // Update the total price of the cart
                                            cart.totalP += article.prixvente;
  
                                            // Call your service to update the cart
                                            this.panierService.updatePanier(cart.id, cart).subscribe(
                                                (response) => {
                                                    console.log("Cart updated successfully:", response);
                                                },
                                                (error) => {
                                                    console.error("Error updating cart:", error);
                                                }
                                            );
                                        } else {
                                            console.error("Quantity in cart exceeds available quantity");
                                            // Handle the situation where the quantity in cart exceeds available quantity
                                        }
                                    } else {
                                        // Create a new cart for the partner
                                        this.createCart(partnerId, article);
                                    }
                                },
                                (error) => {
                                    console.error("Error retrieving carts:", error);
                                }
                            );
                        },
                        error => {
                            console.error('Error retrieving partner ID:', error);
                        }
                    );
                },
                error => {
                    console.error('Error retrieving user ID:', error);
                }
            );
        }
    }
  }
  
  createCart(partnerId: any, article: any) {
    // Create a new cart for the partner
    this.panierService.addPanier(partnerId).subscribe(
        (newCartId: number) => {
            console.log("New cart created with ID:", newCartId);
  
            // Retrieve the newly created cart from the server
            this.panierService.getPanierById(newCartId).subscribe(
                (newCart: any) => {
                    console.log("New cart details:", newCart);
                  if (newCart.quantitecde < article.quantiter) {
                    newCart.quantitecde++ || 0;
                    // Set the initial quantity to 1 and calculate the total price
                    newCart.quantitecde++;
                    newCart.totalP = article.prixvente * newCart.quantitecde;
  
                    // Add the article to the new cart
                    this.panierService.addToCart(article.id, newCartId, partnerId).subscribe(
                        (response) => {
                            console.log("Article added to cart successfully:", response);
                        },
                        (error) => {
                            console.error("Error adding article to cart:", error);
                        }
                        
                    );
                  } else {
                    console.error("Quantity in cart exceeds available quantity");
                    // Handle the situation where the quantity in cart exceeds available quantity
                    const errorMessage = "Quantity in cart exceeds available quantity";
                    console.error(errorMessage);
                    // Handle the situation where the quantity in cart exceeds available quantity
                    // For example, display this error message in your UI
                    this.errorMessage = errorMessage;
                }
                },
                (error) => {
                    console.error("Error retrieving new cart details:", error);
                }
            );
        },
        (error) => {
            console.error("Error creating new cart:", error);
        }
    );
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