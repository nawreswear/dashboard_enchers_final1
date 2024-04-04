import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArticleService } from '../article.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../_service/auth.service';
import { BehaviorSubject, of } from 'rxjs';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
interface Article {
  id: number;
  titre: string;
  description: string;
  photo: string;
  prix: string;
  prixvente: string;
  livrable:boolean;
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
  editForm: FormGroup;
  public loading: boolean = false;
  public photoUrl: string = '';
  public myForm!: FormGroup;
  selectedArticle: Article | null = null;
  vendeur: { id: number } = { id: 0 };
  urlPattern = new RegExp('^(https?:\\/\\/)?'+ // Protocole
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // Nom de domaine
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // Ou une adresse IP (v4) 
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // Port et chemin
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // Paramètres de requête
  '(\\#[-a-z\\d_]*)?$','i'); // Fragment
  onCreatee = false;
  newArticle: Article = {
    id: 0,
    titre: '',
    description: '',
    photo: '',
    prix:'',
    prixvente:'',
    livrable:false,
    statut:'',
    quantiter:0,
    vendeur: { id: 0 } ,
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
    private snackBar: MatSnackBar
  ) 
  { this.userType = this.authService.getUserType();
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
    {
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
      vendeur:[0]
    });
  }
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    console.log("storedTokennnn",storedToken);
    const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
    console.log(tokenPayload);
    if (tokenPayload.sub) {
      const username = tokenPayload.sub;
      console.log('Nom utilisateur :', username);
  } else {
      console.log('Aucun nom d\'utilisateur trouvé dans le token');
  }
    this.token.next(storedToken);
    //this.decodeToken();
  }
  this.tokenObs$.subscribe({
    next: (token) => {
      if (!token) router.navigate(['/']);
    },
  });
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
  
  ngOnInit() {
    this.initForm();
    this.getAllArticles();
    this.showEditForm = false;
    this.getUserIdObservable().subscribe(userId => {
      if (userId !== null) {
        this.userId = userId;
        this.newArticle.vendeur = { id: userId }; // Assurez-vous de mettre à jour vendeur lorsque userId est défini
      }
    });
    this.userId$ = this.getUserIdObservable(); 
  }
  initForm() {
    this.editForm = this.formBuilder.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      photo: ['', Validators.required],
      prix: ['', Validators.required],
      prixvenet: ['', Validators.required],
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
   
  ArticleAdded :any[]=[]
  
  addToCart(article: any) {
    // Incrémentez la quantité à chaque clic sur "Add to Cart"
    if (!article.quantity) {
        article.quantity = 1; // Si la quantité n'est pas définie, initialisez-la à 1
    } else {
        article.quantity++; // Incrémentez la quantité
    }

    // Appelez votre service pour ajouter l'article au panier avec la quantité mise à jour
    this.articleService.addArticleToCart(article,article.quantity).subscribe(
        (response) => {
            // Gérer la réponse du service si nécessaire
            console.log("Article ajouté au panier avec succès :", response);
        },
        (error) => {
            // Gérer l'erreur si nécessaire
            console.error("Erreur lors de l'ajout de l'article au panier :", error);
        }
    );

    const articleId = article.id; // Récupération de l'ID de l'article ajouté
    console.log("ID de l'article ajouté au panier :", articleId);
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
      console.log("vvvvv",article.vendeur?.id)
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
      console.log("avant update",this.updateArticle(this.editArticle!));
      this.updateArticle(this.editArticle!);
      console.log("apres update",this.updateArticle(this.editArticle!));
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
        vendeur: this.editArticle.vendeur, 
        categorie: this.editArticle.categorie,// Utilisez la valeur existante de vendeur de l'article en cours d'édition
      };
      this.articleService.updateArticle(updatedArticleData.id.toString(), updatedArticleData).subscribe(
        response => {
          console.log("updatedArticleData",updatedArticleData);
          this.isModificationActive = false;
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
