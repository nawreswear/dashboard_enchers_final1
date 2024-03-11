import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ArticleService } from '../article.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';

interface Article {
  id: number;
  titre: string;
  description: string;
  photo: string;
  prix: string;
  Livrable: boolean;
  statut: string; 
  quantite: number;
}

@Component({
  selector: 'app-articles',
  templateUrl: './articles.component.html',
  styleUrls: ['./articles.component.css']
})
export class ArticlesComponent implements OnInit {
  displayedColumns = ['titre', 'description', 'photo', 'prix', 'Livrable', 'status', 'quantite', 'actions'];
  public editMode: boolean = false;
  public articles: Article[] = [];
  public editArticle: Article | null = null;
  public loading: boolean = false;
  public photoUrl: string = '';
  public myForm!: FormGroup;
  urlPattern = new RegExp('^(https?:\\/\\/)?'+ // Protocole
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // Nom de domaine
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // Ou une adresse IP (v4) 
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // Port et chemin
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // Paramètres de requête
  '(\\#[-a-z\\d_]*)?$','i'); // Fragment
  editForm!: FormGroup; 
  onCreatee = false;
  newArticle: Article = {
    id: 0,
    titre: '',
    description: '',
    photo: '',
    prix:'',
    Livrable:false,
    statut:'',
quantite:0
  };
  constructor(
    private formBuilder: FormBuilder,
    private articleService: ArticleService,
    private snackBar: MatSnackBar
  ) 
  {
    this.myForm = this.formBuilder.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      photo: ['', Validators.required],
      prix: ['', Validators.required],
      Livrable: [false],
      statut: [''],
      quantite: [0],
    });
    {
    this.editForm = this.formBuilder.group({
      titre: ['', Validators.required],
      description: ['', Validators.required],
      photo: ['', Validators.required],
      prix: ['', Validators.required],
      Livrable: [false],
      statut: [''],
      quantite: [0],
    });
  }
  }
  ngOnInit() {
    this.getAllArticles();
  }

  getAllArticles() {
    this.articleService.getAllArticles().subscribe(
      (articles: Article[]) => {
        this.articles = articles;
      },
      (error: HttpErrorResponse) => {
        console.error('Erreur lors du chargement des articles:', error);
        this.snackBar.open('Erreur lors du chargement des articles!', 'Fermer', {
          duration: 3000
        });
      }
    );
    
  }

  editArticleFunc(article: Article) {
    this.editMode = true;
    this.editArticle = article;
    this.editForm.patchValue({
      titre: article.titre,
      description: article.description,
      photo: article.photo,
      prix: article.prix,
      Livrable: article.Livrable,
      status: article.statut,
      quantite: article.quantite
    });
    this.photoUrl = article.photo;
  }
  cancelEdit() {
    this.editMode = false; // Quitte le mode édition
    this.editArticle = null; // Réinitialise l'article en cours d'édition
    this.editForm.reset(); // Réinitialise le formulaire d'édition
    this.photoUrl = ''; // Réinitialise l'URL de la photo
  }
  
  deleteArticle(id: string) {
    this.articleService.deleteArticle(id).subscribe(
      response => {
        if (typeof response === 'string') {
          this.snackBar.open('Article supprimé avec succès!', 'Fermer', {
            duration: 3000
          });
          this.getAllArticles();
          window.location.reload();
        }
      },
      (error: HttpErrorResponse) => {
        console.error("Erreur lors de la suppression de l'article:", error.error);
        window.location.reload();
        this.snackBar.open('Erreur lors de la suppression de l\'article: ' + error.error, 'Fermer', {
          duration: 3000,
        } );
      }
    );
  }

  cancelCreation() {
    this.onCreatee = false;
    this.myForm.reset(); // Réinitialise le formulaire
    this.photoUrl = '';
  }

  onSubmit() {
    if (this.editMode) {
      this.updateArticle(this.editArticle!);
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
        Livrable: this.editForm.value.Livrable,
        statut: this.editForm.value.statut,
        quantite: this.editForm.value.quantite
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
  
  createArticle() {
    this.onCreatee = true;
    if (this.myForm.valid) {
      const newArticle: Article = {
        titre: this.myForm.value.titre,
        description: this.myForm.value.description,
        photo: this.myForm.value.photo,
        prix: this.myForm.value.prix,
        Livrable: this.myForm.value.Livrable,
        statut: this.myForm.value.statut,
        quantite: this.myForm.value.quantite,
        id: 0 // Assuming auto-generated ID, adjust if needed
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
