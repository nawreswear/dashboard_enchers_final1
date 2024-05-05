import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Article, Paiement, Panier, PanierService, PartEn } from '../panier.service';
import { ArticleService } from 'src/app/article.service';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { User } from 'src/app/_service/user';
import { EnchersServiceService } from 'src/app/enchers-service.service';
import { PartEnService } from 'src/app/part-en.service';
import { PaiementService } from '../paiement.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
import { MatIconModule } from '@angular/material/icon';
@Component({
  selector: 'app-panier',
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.css']
})
export class PanierComponent implements OnInit {
  @Input() panier: Panier = {} as Panier;
  @ViewChild('htmlData') htmlData!: ElementRef;
@Output() onOrderFinished = new EventEmitter();
  idRequis: number;
  userId: number | null = null;
  panierDetails: any[] = [];
 // userId$: Observable<User | null> = this.getUserIdObservable();
  token = new BehaviorSubject<string | null>(null);
  tokenObs$ = this.token.asObservable();
  collapsed: boolean = true;
  parten: any | null = null;

 
 public panierItems: any[] = [];
  constructor(public panierService: PanierService, private articleService: ArticleService,private paiementService: PaiementService,
    private encherService :  EnchersServiceService, private  partEnService : PartEnService,    private snackBar: MatSnackBar,
    private router: Router,private toastrService: ToastrService,private toastr: ToastrService) { 
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

  ngOnInit() {
    this.getPartenIdByUserId();
    this.getPanierDetails;
   // this.invokeStripe();
 }
 
  ajouterArticle(article: any) {
    this.panierItems.push(article);
    // Ajouter le prix de vente de l'article à la somme totale du panier
    this.total += article.prixvente;
}

// Remove an article from the cart
removeArticle(index: number) {
  // Check if this.panierItems[index] exists before accessing its properties
  if (this.panierItems[index]) {
    // Remove the article from the panierItems array
    this.panierItems.splice(index, 1);

    // Retrieve the user's ID from local storage
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      // Parse the token payload to extract user information
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      if (tokenPayload.sub) {
        // Extract the username from the token payload
        const username = tokenPayload.sub;

        // Call the service to find the user ID by username
        this.encherService.findUserIdByNom(username).subscribe(
          userId => {
            console.log('User ID found:', userId);

            // Once you have the user ID, retrieve the partner ID
            this.partEnService.getPartenIdByUserId(userId).subscribe(
              partnerId => {
                console.log('Partner ID found:', partnerId);

                // Call the service to get the carts associated with the partner
                this.panierService.getPaniersByPartenaire(partnerId).subscribe(
                  (carts: any[]) => {
                    // Check if carts exist and if there is at least one cart
                    if (carts && carts.length > 0) {
                      // Select the first cart from the array
                      const cart = carts[0];

                      // Log the article's quantity
                      console.log("Article quantity:", this.panierItems[index].quantiter);

                      // Check if the quantity in the cart does not exceed the available quantity
                      if (cart.quantitecde < this.panierItems[index].quantiter) {
                        console.log("Cart quantity:", cart.quantitecde);

                        // Update the cart with the article's quantity and price
                        cart.quantitecde--;

                        // Update the total price of the cart
                        cart.totalP -= this.panierItems[index].prixvente;

                        // Call your service to update the cart
                        this.panierService.updatePanier(cart.id, cart).subscribe(
                          (response) => {
                            console.log("Cart updated successfully:", response);
                            this.snackBar.open('Article supprimer dans le panier avec succès :', 'Fermer', {
                              duration: 3000
                            });
                            this.getPanierDetails;
                          },
                          (error) => {
                            console.error("Error updating cart:", error);
                          }
                        );
                      } else {
                        console.error("Quantity in cart exceeds available quantity");
                        // Handle the situation where the quantity in the cart exceeds available quantity
                      }
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
  } else {
    console.error("The article at index", index, "does not exist.");
  }
}


  errorMessage: string = '';
  addToCart(article: any) {
    // Récupérer l'ID de l'utilisateur
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
        if (tokenPayload.sub) {
            const username = tokenPayload.sub;
            // Trouver l'ID de l'utilisateur par son nom d'utilisateur
            this.encherService.findUserIdByNom(username).subscribe(
                userId => {
                    console.log('ID utilisateur trouvé :', userId);
                    // Une fois que vous avez l'ID de l'utilisateur, récupérez l'ID du partenaire
                    this.partEnService.getPartenIdByUserId(userId).subscribe(
                        partnerId => {
                            console.log('ID partenaire trouvé :', partnerId);
                            // Appelez votre service pour obtenir les paniers associés au partenaire
                            this.panierService.getPaniersByPartenaire(partnerId).subscribe(
                                (carts: any[]) => {
                                    // Vérifiez si les paniers existent
                                    if (carts && carts.length > 0) {
                                        // Sélectionnez le premier panier du tableau
                                        const cart = carts[0];
                                        console.log("Quantité de l'article :", article.quantite);
                                        
                                        // Vérifiez si la quantité dans le panier ne dépasse pas la quantité disponible
                                        this.panierService.containsArticle(cart.id, article.id).subscribe(
                                          (articleExists: boolean) => {
                                            if (articleExists) {
                                              console.log("L'article existe dans le panier.");
  
                                              // Mettez à jour le panier avec la quantité et le prix de l'article
                                              cart.quantitecde++;
                                              cart.totalP = article.prixvente + cart.totalP;
  
                                              // Appelez votre service pour mettre à jour le panier
                                              this.panierService.updatePanier(cart.id, cart).subscribe(
                                                  (response) => {
                                                      console.log("Panier mis à jour avec succès :", response);
                                                   
                                                      this.getPanierDetails;
                                                  },
                                                  (error) => {
                                                      console.error("Erreur lors de la mise à jour du panier :", error);
                                                  }
                                              );
                                            } else {
                                              console.log("L'article n'existe pas dans le panier. Création d'un nouveau panier.",partnerId,cart.id,article);
                                              cart.quantitecde++;
                                              cart.totalP = article.prixvente + cart.totalP;
                                              console.log("existingCart.id",cart.id);
                                              // Appeler le service pour ajouter l'article au panier
                                              this.panierService.addToCart(article.id, cart.id, partnerId).subscribe(
                                                (response) => {
                                                  console.log("Article ajouté au panier avec succès:", response);
                                                  this.snackBar.open('Article ajouté au panier avec succès :', 'Fermer', {
                                                    duration: 3000
                                                  });
                                                  this.getPanierDetails;
                                                },
                                                (error) => {
                                                  console.error("Erreur lors de l'ajout de l'article au panier:", error);
                                                }
                                              );
                
                                            }
                                          },
                                          (error) => {
                                            console.error("Erreur lors de la vérification de l'article dans le panier :", error);
                                          }
                                        );
                                    } else {
                                        // Créez un nouveau panier pour le partenaire et ajoutez l'article
                                        console.log("L'article n'existe pas dans le panier. Création d'un nouveau panier.",partnerId,article);
                                        this.createCart(partnerId, article);
                                    }
                                },
                                (error) => {
                                    console.error("Erreur lors de la récupération des paniers :", error);
                                }
                            );
                        },
                        error => {
                            console.error('Erreur lors de la récupération de l\'ID partenaire:', error);
                        }
                    );
                },
                error => {
                    console.error('Erreur lors de la récupération de l\'ID utilisateur:', error);
                }
            );
        }
    }
  }
  
  createCart(partnerId: any, article: any) {
    // Créer un nouveau panier pour le partenaire
    this.panierService.addPanier(partnerId).subscribe(
        (newCartId: number) => {
            console.log("Nouveau panier créé avec l'ID :", newCartId);
  
            // Récupérer le nouveau panier créé depuis le serveur
            this.panierService.getPanierById(newCartId).subscribe(
                (newCart: any) => {
                    console.log("Détails du nouveau panier :", newCart);
                    //  if (newCart.quantitecde < article.quantiter) {
                    newCart.quantitecde++ || 0;
                    newCart.totalP = article.prixvente + newCart.totalP;
                    // Ajouter l'article au nouveau panier
                    this.panierService.addToCart(article.id, newCartId, partnerId).subscribe(
                        (response) => {
                            console.log("Article ajouté au panier avec succès :", response);
                            this.snackBar.open('Article ajouté au panier avec succès :', 'Fermer', {
                              duration: 3000
                            });
                            this.getPanierDetails;
                        },
                        (error) => {
                            console.error("Erreur lors de l'ajout de l'article au panier :", error);
                        }
                        
                    );
          
                },
                (error) => {
                    console.error("Erreur lors de la récupération des détails du nouveau panier :", error);
                }
            );
        },
        (error) => {
            console.error("Erreur lors de la création du nouveau panier :", error);
        }
    );
  }

  checkoutProduct(){
   // this.makePayment();
   this.passerAuPaiement();
    }
    total=0;
   /* 
    makePayment() {
    let amount = this.total
    const paymentHandler = (<any>window).StripeCheckout.configure({
    key: this.stripeAPIKey,
    locale: 'auto',
    token: (stripeToken : any) => {
    this.processPayment(amount, stripeToken);
    },
    });
    paymentHandler.open({
    name: 'ItSolutionStuff.com',
    description: '3 widgets',
    amount: amount * 100,
    });
    }
    
    paymentHandler: any = null;
    stripeAPIKey: any ='pk_test_51N3okJAtYSZefbGPPzDxn721BdagE4SahC951XgF9EMVF4mcDEibV9FedHowP0S7zxhWKpKs40Yz6qcF59fPxrNJ00XYcmk1cy';
    invokeStripe() {
      if (!window.document.getElementById('stripe-script')) {
        const script = window.document.createElement('script');
        script.id = 'stripe-script';
        script.type = 'text/javascript';
        script.src = 'https://checkout.stripe.com/checkout.js';
        script.onload = () => {
          this.paymentHandler = (<any>window).StripeCheckout.configure({
            key: this.stripeAPIKey,
            locale: 'auto',
            token: function (stripeToken: any) {
              console.log(stripeToken);
              alert('Payment has been successfull!');
            },
          });
        };
        window.document.body.appendChild(script);
      }
    }
    processPayment(amount: any, stripeToken: any) {
      console.log(stripeToken);
      const data = {
        montant: amount * 100, // Assurez-vous que la clé correspond à la propriété "montant" de votre modèle
        token: stripeToken,// Ajoutez d'autres données si nécessaire
      };
      console.log("this.panier", this.panierDetails[0])
      this.passerAuPaiement();
      this.onOrderFinished.emit(false);
      this.total = 0;
    }   */
    showSuccessNotification() {
      this.toastr.success('Paiement effectué avec succès', 'Paiement', {
        toastClass: 'payment-notification',
        progressBar: true,
        positionClass: 'toast-top-center'
      });
    }
    passerAuPaiement() {
      console.log("this.panier :", this.panierDetails);
      this.panier = this.panierDetails[0];
      // Appeler la méthode passerAuPaiement du service PaiementService
      this.paiementService.passerAuPaiement(this.panier).subscribe(
        (paiement: Paiement) => {
            console.log("Paiement effectué avec succès :", paiement);
            console.log("Panier :", this.panierDetails[0]);
            this.showSuccessNotification();
            // Mettre à jour le statut du paiement
            this.paiementService.updatePaiementstatut(paiement.id).subscribe(
              (updatedPaiement: Paiement) => {
                console.log("Statut du paiement mis à jour avec succès ", updatedPaiement);
                // Supprimer tous les articles de tous les paniers
                for (const panier of this.panierDetails) {
                  for (const article of panier.articles) {
                      this.articleService.supprimerArticleDuPanier(panier.id, article.id).subscribe(
                          (response) => {
                              console.log('Article supprimé du panier avec succès :', response);
                          
                              // Rechercher l'article dans panierItems pour obtenir son prix de vente
                              const articlee = this.panierItems.find(item => item.id === article.id);
                              if (articlee) {
                                  // Soustraire le prix de vente de l'article de la somme totale du panier
                                  this.total -= articlee.prixvente;
                              }
                          },
                          (error) => {
                              console.error('Une erreur s\'est produite lors de la suppression de l\'article du panier :', error);
                              // Traitez l'erreur comme vous le souhaitez, par exemple afficher un message d'erreur à l'utilisateur.
                          }
                      );
                  }
                  // Réinitialiser la liste des articles du panier à une liste vide
                  panier.articles = [];
                  // Réinitialiser les valeurs totalP et quantitecde du panier à zéro
                  panier.totalP = 0;
                  panier.quantitecde = 0;
                }
                // Mettre à jour le panier dans le service
                this.paiementService.viderPanierApresPaiement(paiement.id).subscribe(
                    () => {
                        console.log("Panier vidé avec succès après le paiement :", this.panierDetails[0]);
                        // Réinitialiser le total à zéro car tous les articles ont été supprimés
                        this.total = 0;
                        // Traitez la réponse comme vous le souhaitez, par exemple, afficher un message de confirmation
                    },
                    (error) => {
                        console.error("Erreur lors de la suppression du panier après le paiement :", error);
                        // Traitez l'erreur comme vous le souhaitez, par exemple, afficher un message d'erreur à l'utilisateur
                    }
                );
            },
            (error) => {
              alert("Erreur : Opération non effectuée");
                console.error("Erreur lors du paiement :", error);
                // Traitez l'erreur comme vous le souhaitez, par exemple, afficher un message d'erreur à l'utilisateur
            }
          );
      });
    }
   @Input() ArticleAdded: any;

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
 getArticlesUniques(): any[] {
  const articlesUniques: any[] = [];

  if (this.panierDetails && this.panierDetails.length > 0) {
    this.panierDetails.forEach((panier: Panier) => {
      panier.articles.forEach((article: any) => {
        // Vérifiez si l'article n'est pas déjà dans la liste des articles uniques
        if (!articlesUniques.some((a: any) => a.id === article.id)) {
          articlesUniques.push(article);
        }
      });
    });
  }

  return articlesUniques;
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
  genererPDF() {
    const elementAConvertir = document.getElementById('article'); // Remplacez 'panierDetails' par l'ID de votre élément de panier
  
    if (!elementAConvertir) {
      console.error("L'élément à convertir en PDF est null");
      return;
    }
  
    html2canvas(elementAConvertir).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210; // Largeur de la page A4 en mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
  
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('panier.pdf');
    });
  }

  /*openPDF() {
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
  }*/

  removeFromPanier(panierId: number, articleId: number) {
    this.articleService.supprimerArticleDuPanier(panierId, articleId).subscribe(
        (response) => {
            console.log('Article supprimé du panier avec succès :', response);
            this.snackBar.open('Article supprimé du panier avec succès :', 'Fermer', {
              duration: 3000
            });
            this.getPanierDetails;
            this.panierService.getPanierAvecIdPartenaire(panierId).subscribe(
                (paniers: Panier[]) => {
                    if (paniers && paniers.length > 0) {
                        const panier = paniers[0];
                        if (panier.quantitecde === 0 && panier.totalP === 0) {
                            // Si la quantitecde et le totalP sont tous deux égaux à zéro, vider complètement le panier
                            this.panierItems = [];
                        }
                    } else {
                        console.error("Aucun panier trouvé avec l'ID :", panierId);
                    }
                },
                (error) => {
                    console.error("Erreur lors de la récupération des détails du panier :", error);
                }
            );
        },
        (error) => {
            console.error('Une erreur s\'est produite lors de la suppression de l\'article du panier :', error);
            // Traitez l'erreur comme vous le souhaitez, par exemple afficher un message d'erreur à l'utilisateur.
        }
    );
}
  
viderPanier(id: number): void {
  if (id !== undefined) {
    this.articleService.viderPanier(id).subscribe(
      () => {
        console.log('Le panier a été vidé avec succès');
        this.snackBar.open('Le panier a été vidé avec succès :', 'Fermer', {
          duration: 3000
        });
        // Ajoutez ici le traitement supplémentaire après la suppression du panier
        this.getPanierDetails;
      },
      (error) => {
        console.error('Une erreur s\'est produite lors du vidage du panier :', error);
        // Ajoutez ici la gestion des erreurs
      }
    );
  }
}

}