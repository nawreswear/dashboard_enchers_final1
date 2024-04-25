import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArticleService } from '../article.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';

import { AuthService } from '../_service/auth.service';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { PanierService } from '../shopping-cart/cards/panier.service';
import { EnchereService } from '../admin-dashboard/enchers-service.service';
import { EnchersServiceService } from '../enchers-service.service';
import { PartEnService } from '../part-en.service';

interface Article {
  id: number;
  titre: string;
  description: string;
  photo: string;
  prix: string;
  prixvente?: number;
  livrable: boolean;
  statut: string;
  quantiter: number;
  vendeur: { id: number };
  categorie: Categorie;
}

interface Categorie {
  id: number;
  titre: string;
  description: string;
  image: string;
}

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {
  displayedColumns = ['titre', 'description', 'photo', 'prix', 'Livrable', 'status', 'quantite', 'actions'];
  public editMode: boolean = false;
  userId!: number | null;
  editingArticle: Article | null = null;
  userId$: Observable<number | null> = this.getUserIdObservable();
  public articles: Article[] = [];
  public editArticle: Article | null = null;
  editForm!: FormGroup;
  public vendeurId: number = 0; // Utilisation de 'public' pour déclarer une variable membre
  public loading: boolean = false;
  public photoUrl: string = '';
  public myForm!: FormGroup;
  selectedArticle: Article | null = null;
  vendeur: { id: number } = { id: 0 };
  urlPattern = new RegExp('^(https?:\\/\\/)?' + // Protocole
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // Nom de domaine
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // Ou une adresse IP (v4) 
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // Port et chemin
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // Paramètres de requête
    '(\\#[-a-z\\d_]*)?$', 'i'); // Fragment
  onCreatee = false;
  newArticle: Article = {
    id: 0,
    titre: '',
    description: '',
    photo: '',
    prix: '',
    prixvente: 0,
    livrable: false,
    statut: '',
    quantiter: 0,
    vendeur: { id: 0 },
    categorie: { id: 0, titre: '', description: '', image: '' }
  };
  isModificationActive: boolean = false;
  userType: string | string[] | null;
  categories: Categorie[] = [];
  token = new BehaviorSubject<string | null>(null);
  tokenObs$ = this.token.asObservable();
  showEditForm: boolean = false;
  constructor(
    private formBuilder: FormBuilder, public authService: AuthService,
    private articleService: ArticleService, public router: Router,
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private  panierService :PanierService,
    private encherService :  EnchersServiceService,
   private  partEnService : PartEnService
  ) {
    this.userType = this.authService.getUserType();
    this.myForm = this.formBuilder.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      photo: ['', Validators.required],
      prix: ['', Validators.required],
      prixvente: ['', Validators.required],
      livrable: [false],
      statut: [''],
      quantiter: [0],
      categorie: [0],
      vendeur: [0]
    });

    this.editForm = this.formBuilder.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      photo: ['', Validators.required],
      prix: ['', Validators.required],
      prixvente: ['', Validators.required],
      livrable: [false],
      statut: [''],
      quantiter: [0],
      categorie: [0],
      vendeur: [0]
    });

    this.checkToken();
  }

  ngOnInit() {
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
            // Faites ce que vous devez faire avec l'ID du partenaire ici
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
    this.initForm();
    this.getAllArticles();
    this.getAllCategories();
    this.showEditForm = false;
    this.getUserIdObservable().subscribe(userId => {
      if (userId !== null) {
        this.userId = userId;
        this.newArticle.vendeur = { id: userId }; // Assurez-vous de mettre à jour vendeur lorsque userId est défini
      }
    });
    this.userId$ = this.getUserIdObservable();
  
  }
  getAllCategories() {
    this.articleService.getAllCategories().subscribe(
      (categories: Categorie[]) => {
        this.categories = categories;
      },
      (error) => {
        console.error('Erreur lors du chargement des catégories:', error);
        // Gérer l'erreur comme nécessaire
      }
    );
  }
  initForm() {
    this.editForm = this.formBuilder.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      photo: ['', Validators.required],
      prix: ['', Validators.required],
      prixvente: ['', Validators.required], 
      livrable: [false],
      statut: [''],
      quantiter: [0],
      categorie: [0],
    });
  }
  showArticleDetails(article: Article) {
    this.selectedArticle = article;
    // Ajoutez d'autres logiques si nécessaire
  }
  closeArticleDetails() {
    this.selectedArticle = null;
  
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
                                          const errorMessage = "Quantity in cart exceeds available quantity";
                                          console.error(errorMessage);
                                          // Handle the situation where the quantity in cart exceeds available quantity
                                          // For example, display this error message in your UI
                                          this.errorMessage = errorMessage;
                                          setTimeout(() => {
                                            this.errorMessage = '';
                                        }, 300000); // 300000 milliseconds = 5 minutes
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

  getAllArticles() {
    this.articleService.getAllArticles().subscribe(
      (articles: Article[]) => {
        this.articles = articles;
        // Une fois que vous avez récupéré les articles, vous pouvez appeler getCategoryForArticle pour chaque article
        this.articles.forEach(article => {
          this.getCategoryForArticle(article);
        });
      },
      (error) => {
        console.error('Erreur lors du chargement des articles:', error);
        // Gérer l'erreur comme nécessaire
      }
    );
  }

  getCategoryForArticle(article: Article) {
    this.articleService.getCategoryById(article.categorie.id.toString()).subscribe(
      (categorie: Categorie) => {
        // Mettre à jour les informations sur la catégorie de l'article
        article.categorie = categorie;
      },
      (error) => {
        console.error('Erreur lors de la récupération de la catégorie pour l\'article:', error);
        // Gérer l'erreur comme nécessaire
      }
    );
  }
  saveEdit() {
    if (this.editForm.valid && this.editingArticle) {
      const updatedArticle: Article = {
        ...this.editingArticle,
        ...this.editForm.value
      };
      this.articleService.updateArticle(updatedArticle.id.toString(), updatedArticle).subscribe(
        response => {
          this.snackBar.open('Article mis à jour avec succès!', 'Fermer', {
            duration: 3000
          });
          this.getAllArticles();
          this.getAllCategories();
          this.cancelEdit();
        },
        (error: HttpErrorResponse) => {
          console.error('Erreur lors de la mise à jour de l\'article:', error);
          this.snackBar.open('Erreur lors de la mise à jour de l\'article: ' + error.message, 'Fermer', {
            duration: 3000
          });
        }
      );
    }
  }
  disableModificationFeature() {
    this.isModificationActive = false;
  }
  showEditArticleForm(article: Article) {
    this.fillEditForm(article);
    this.showEditForm = true;
  }
  fillEditForm(article: Article) {
    this.editForm.patchValue({
      titre: article.titre,
      photo: article.photo,
      quantiter: article.quantiter,
      prix: article.prix,
      prixvente: article.prixvente,
      statut: article.statut,
      livrable: article.livrable,
      description: article.description
    });
  }
  // Ajoutez une méthode pour masquer le formulaire de modification
  hideEditArticleForm() {
    this.showEditForm = false;
  }
  isLoggedIn() {
    return this.authService.isLoggedIn();
  }
  isUserTheSeller(article: Article): boolean {
    if (this.authService.isLoggedIn() && this.userType === 'vendeur') {
     // console.log("vvvvv",article.vendeur?.id)
      return article.vendeur && article.vendeur.id === this.userId;
    }
    return false;
  }
  
  getUserIdObservable(): Observable<number | null> {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
        const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
        if (tokenPayload.sub) {
            const username = tokenPayload.sub;
            return this.articleService.findUserIdByNom(username).pipe(
                map(userId => userId ? userId : null)
            );
        }
    }
    return of(null);
}
editArticleFunc(article: Article) {
  this.isModificationActive = true;
  this.editMode = true;
  this.editArticle = article;
  this.editForm.patchValue({
      titre: article.titre,
      description: article.description,
      photo: article.photo,
      prix: article.prix,
      livrable: article.livrable,
      statut: article.statut,
      prixvente: article.prixvente,
      quantiter: article.quantiter,
      categorie: article.categorie,
      vendeur:article.vendeur
  });
  // Assurez-vous que userId est défini avant de l'utiliser dans la condition
  if (this.userId !== null) {
      // Mettez à jour vendeur avec l'ID de l'utilisateur actuellement connecté
      this.editArticle.vendeur = { id: this.userId };
  }
}
 cancelEdit() {
    this.editMode = false; // Quitte le mode édition
    this.editArticle = null; // Réinitialise l'article en cours d'édition
    this.editForm.reset(); // Réinitialise le formulaire d'édition
    this.photoUrl = ''; // Réinitialise l'URL de la photo
    this.showEditForm = false;
    this.isModificationActive = false;
  }
  
  deleteArticle(id: string) {
    if (confirm('Voulez-vous vraiment supprimer cet article?')) {
      this.articleService.deleteArticle(id).subscribe(
        response => {
          if (typeof response === 'string') {
            this.snackBar.open('Article supprimé avec succès!', 'Fermer', {
              duration: 3000
            });
            this.getAllArticles();
          }
        },
        (error: HttpErrorResponse) => {
          console.error("Erreur lors de la suppression de l'article:", error.error);
          this.snackBar.open('Erreur lors de la suppression de l\'article: ' + error.error, 'Fermer', {
            duration: 3000,
          });
        }
      );
    }
  }

  cancelCreation() {
    this.onCreatee = false;
    this.myForm.reset(); // Réinitialise le formulaire
    this.photoUrl = '';
  }
  onSubmit() {
    if (this.editMode) {
      console.log("avant onSubmit - editMode", this.editMode);
      if (this.editForm && this.editForm.valid && this.editArticle) {
        console.log("apres onSubmit - editMode", this.editArticle);
        // Appeler la méthode updateArticle avec subscribe pour réagir à la réponse de la requête HTTP
        this.updateArticle(this.editArticle);
      }
    } else {
      this.createArticle();
    }
  }   
  updateArticle(updatedArticle: Article) {
    if (this.editForm && this.editForm.valid && this.editArticle) {
      const updatedArticleData: Article = {
        id: this.editArticle.id,
        titre: this.editForm.value.titre,
        description: this.editForm.value.description,
        photo: this.editForm.value.photo,
        prix: this.editForm.value.prix,
        prixvente: this.editForm.value.prixvente,
        livrable: this.editForm.value.livrable,
        statut: this.editForm.value.statut,
        quantiter: this.editForm.value.quantiter,
        categorie: {
          id: this.editForm.value.categorie,
          titre: '', 
          description: '',
          image: ''
        },
        vendeur: { id: this.editArticle.vendeur.id } // Ajoutez le vendeur à l'article mis à jour
      };
      this.articleService.updateArticle(updatedArticleData.id.toString(), updatedArticleData).subscribe(
        Response => {
          this.editMode = false;
          this.editArticle = null;
          this.editForm.reset();
          this.photoUrl = '';
          this.getAllArticles();
          this.snackBar.open('Article mis à jour avec succès!', 'Fermer', {
            duration: 3000
          });
        },
        (error: HttpErrorResponse) => {
          console.error('Erreur lors de la mise à jour de l\'article:', error);
          this.snackBar.open('Erreur lors de la mise à jour de l\'article: ' + error.message, 'Fermer', {
            duration: 3000
          });
        }
      );
    }
  }
   private checkToken() {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
      if (tokenPayload.sub) {
        const username = tokenPayload.sub;
        console.log('Nom utilisateur :', username);
      } else {
        console.log('Aucun nom d\'utilisateur trouvé dans le token');
      }
      this.token.next(storedToken);
    }
    this.tokenObs$.subscribe({
      next: (token) => {
        if (!token) this.router.navigate(['/']);
      },
    });
  }
  

 
  createArticle() {
    this.onCreatee = true;
    if (this.myForm.valid) {
      const newArticle: Article = {
        titre: this.myForm.value.titre,
        description: this.myForm.value.description,
        photo: this.myForm.value.photo,
        prix: this.myForm.value.prix,
        prixvente: this.myForm.value.prixvente,
        livrable: this.myForm.value.livrable,
        statut: this.myForm.value.statut,
        quantiter: this.myForm.value.quantiter,
        id: 0 ,
        vendeur:this.editForm.value.vendeur,
        categorie:this.editForm.value.categorie,
      };
      console.log('Envoi des données au backend.');

      this.articleService.addArticle(newArticle).subscribe(
        response => {
          this.onCreatee = false;       
          this.myForm.reset(); // Clear form data
          this.photoUrl = ''; // Clear image preview
          this.getAllArticles();
          this.snackBar.open('Article créé avec succès!', 'Fermer', {
            duration: 3000
          });
        },
        (error: HttpErrorResponse) => {
          console.error('Erreur lors de la création de l\'article:', error);
          this.snackBar.open('Erreur lors de la création de l\'article: ' + error.message, 'Fermer', {
            duration: 3000
          });
        }
      );
    }
  }

  isValidURL(url: string): boolean {
    // Expression régulière pour valider les URL
    const urlPattern = new RegExp('^(https?:\\/\\/)?([a-z0-9-]+\\.)+[a-z]{2,}([\\/\\?#].*)?$', 'i');
    return urlPattern.test(url);
  }


}
