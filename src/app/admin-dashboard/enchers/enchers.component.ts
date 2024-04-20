import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { ArticleService } from '../article.service';
import {  EMPTY, Observable, Subject,catchError,forkJoin, mergeMap } from 'rxjs';
import { EnchereService } from '../enchers-service.service';
import { Router } from '@angular/router';

interface Enchere {
  id?: number;
  dateDebut: string;
  dateFin: string;
  parten: { id: number}; 
  admin: { id: number };
  articles: { id: number }[];
}
interface admin{
  id?: number;
}
interface Article {
  id: number;
  titre: string;
  description: string;
  photo: string;
  prix:string;
  livrable:boolean;
  statut:string;
  quantiter?: number;
  idEnchere?: number;
}
interface Part_En{
  id: number;
}
let enchereData: Enchere[] = [];
@Component({
  selector: 'app-enchers',
  templateUrl: './enchers.component.html',
  styleUrls: ['./enchers.component.css']
})
export class EnchersComponent implements OnInit {
// Déclaration de la fonction dans la classe de composant
parseDate(dateString: string): number | undefined {
  return parseInt(dateString, 10); // Convertit la chaîne en nombre entier
}
enchereEnCours: any; 
  public myForm!: FormGroup;
  public encheres: Enchere[] = [];
  public loading: boolean = false;
  public editMode: boolean = false;
  public editForm!: FormGroup;
  public articles: any[] = [];
  public partens: any[] = [];
  public admins: any[] = [];
  public showAddForm: boolean = false; 
  public formattedDateDebut!: string;
  public formattedDateFin!: string;
  //private unsubscribe$ = new Subject<void>();
  updatedArticles: any = {};
  constructor(private http: HttpClient,
    private formBuilder: FormBuilder,
    private encherService: EnchereService,
    private snackBar: MatSnackBar,
   private articleService: ArticleService,
   private router: Router,
  ) {
    this.myForm = this.formBuilder.group({
      id: [0],
      dateFin: [new Date()],
      dateDebut: [new Date()],
      parten: ['', Validators.required], 
      admin: ['', Validators.required], 
      articles: this.formBuilder.control([]) // Utilisez control au lieu de array
    });
    
    this.editForm = this.formBuilder.group({
      id: [0],
      dateFin: [new Date()],
      dateDebut: [new Date()],
      parten: ['', Validators.required], 
      admin: ['', Validators.required], 
      articles: this.formBuilder.control(['']), // Contrôle pour les articles
      updatedArticles: this.formBuilder.control('') // Ajoutez ce contrôle pour les articles mis à jour
    });
    this.formattedDateDebut = this.formatDate(this.myForm.value.dateDebut);
    this.formattedDateFin = this.formatDate(this.myForm.value.dateFin);
  }

  ngOnInit() {
    this.getAllEncheres();
    this.getAllArticles();
    this.getAllPartens();
    this.getAllAdmins();
    this.getAllArticles();
  }
  participer() {
    const partEn: Part_En = {
      id: 1 
    };
    this.addPartEn(partEn).subscribe(
      (result: Part_En) => {
        // Gérez la réponse si nécessaire
        console.log('Participation réussie :', result);
        this.snackBar.open('Vous avez participé avec succès!', 'Fermer', {
          duration: 3000
        });
      },
      (error: any) => {
        console.error('Erreur lors de la participation :', error);
        this.snackBar.open('Erreur lors de la participation', 'Fermer', {
          duration: 3000
        });
      }
    );
  }

  addPartEn(partEn: Part_En): Observable<Part_En> {
    return this.encherService.addPart_En(partEn);
  }
  formatDate(timestamp: number | undefined): string {
    if (!timestamp) return ''; // Si le timestamp est indéfini, retourne une chaîne vide

    const date = new Date(timestamp); // Crée une nouvelle instance de Date à partir du timestamp

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}


getAllArticles() {
  this.articleService.getAllArticles().subscribe(
    (articles: Article[]) => {
      this.articles = articles;
    },
    (error: HttpErrorResponse) => {
      console.error('Error fetching articles:', error);
    }
  );
}
addSelectedArticle(articleId: number) {
  const articlesControl = this.myForm.get('articles');
  if (articlesControl) {
    const selectedArticles = articlesControl.value as number[];
    if (!selectedArticles.includes(articleId)) {
      selectedArticles.push(articleId);
      articlesControl.setValue(selectedArticles);
    }
  }
}
  getAllPartens() {
    this.encherService.getAllPartens().subscribe(
      (partens: any[]) => {
        this.partens = partens;
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching partens:', error);
      }
    );
  }

  getAllAdmins() {
    this.encherService.getAllAdmins().subscribe(
      (admins: any[]) => {
        this.admins = admins;
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching admins:', error);
      }
    );
  }
  /*getAllEncheres() {
    this.loading = true;
    this.encherService.getAllEncheres().subscribe(
      (encheres: Enchere[]) => {
        this.encheres = encheres;
        console.log("Enchères récupérées :", encheres); // Afficher toutes les enchères récupérées dans la console
        // Parcourir chaque enchère pour afficher l'ID de l'administrateur
        encheres.forEach(enchere => {
          if (enchere.admin && enchere.admin.id) {
            console.log("ID de l'administrateur pour cette enchère :", enchere.admin.id);
          } else {
            console.log("Aucun administrateur associé à cette enchère.");
          }

        });
        this.loading = false;
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching encheres:', error);
        this.loading = false;
        this.snackBar.open('Error loading encheres!', 'Close', {
          duration: 3000
        });
      }
    );
  }  */
  getAllEncheres() {
    this.loading = true;
    this.encherService.getAllEncheres().subscribe(
      (encheres: Enchere[]) => {
        this.encheres = encheres;
        // Accédez à la propriété parten de chaque objet Enchere pour forcer le chargement
        this.encheres.forEach(enchere => {
          const parten = enchere.parten;
          if (parten && parten.id) {
            console.log("Partenaire chargé pour l'enchère :", parten);
          }
          if (enchere.admin && enchere.admin.id) {
            console.log("ID de l'administrateur pour cette enchère :", enchere.admin.id);
          } else {
            console.log("Aucun administrateur associé à cette enchère.");
          }
        });

        console.log("Enchères récupérées :", encheres);
        this.loading = false;
      },
      (error: HttpErrorResponse) => {
        console.error('Error fetching encheres:', error);
        this.loading = false;
        this.snackBar.open('Error loading encheres!', 'Close', {
          duration: 3000
        });
      }
    );
  } 

  
  async getArticleTitle(articleId: number): Promise<string> {
    try {
        const article = this.articles.find(article => article.id === articleId);
        if (article) {
            return article.description;
        } else {
          console.error('Une erreur s\'est produite lors de la récupération du titre de l\'article :');
            return ''; // Ou renvoyez une valeur par défaut
        }
    } catch (error) {
        console.error('Une erreur s\'est produite lors de la récupération du titre de l\'article :', error);
        return ''; // Ou renvoyez une valeur par défaut en cas d'erreur
    }
}

participerEnchere(userId: number, enchereId: number) {
  this.encherService.participateInEnchere(userId, enchereId).subscribe(
    () => {
      // Mettez à jour les données après la participation à l'enchère
      this.getAllEncheres(); // Met à jour la liste des enchères après la participation
      /* Affichez un message de succès à l'utilisateur
      this.snackBar.open('Vous avez participé à l\'enchère avec succès!', 'Fermer', {
        duration: 3000
      });*/
    },
    (error: HttpErrorResponse) => {
      if (error.status !== 200) {
        console.error('Erreur lors de la participation à l\'enchère :', error);
        // Affichez un message d'erreur à l'utilisateur uniquement si le statut de la réponse est différent de 200
        this.snackBar.open('Erreur lors de la participation à l\'enchère', 'Fermer', {
          duration: 3000
        });
      }else{
        this.snackBar.open('Vous avez participé à l\'enchère avec succès!', 'Fermer', {
          duration: 3000
        });
      }
    }
  );
}
 onCreate() {
    this.showAddForm = true;
    if (this.myForm.valid) {
      const selectedUser = this.partens.find(partner => partner.id === this.myForm.value.parten);
      const selectedAdmin = this.admins.find(admin => admin.id === this.myForm.value.admin);

      if (selectedUser && selectedAdmin) {
        const newEnchere: Enchere = {
          id: this.myForm.value.id,
          dateFin: this.formattedDateFin,
          dateDebut: this.formattedDateDebut,
          parten: { id: selectedUser.id },
          admin: { id: selectedAdmin.id },
          articles: this.myForm.value.articles.map((article: any) => ({ id: article.id }))
        };
        this.encherService.addEnchere(newEnchere).subscribe(
          (response: any) => {
            this.myForm.reset();
            this.encheres.push(response);
            this.snackBar.open('Enchère créée avec succès!', 'Fermer', {
              duration: 3000
            });
          },
          (error: HttpErrorResponse) => {
            console.error('Erreur lors de la création de l\'enchère :', error);
            this.snackBar.open('Erreur lors de la création de l\'enchère', 'Fermer', {
              duration: 3000
            });
          }
        );
      } else {
        console.error('Utilisateur ou administrateur non trouvé.');
        this.snackBar.open('Utilisateur ou administrateur non trouvé.', 'Fermer', {
          duration: 3000
        });
      }
    }
  }
  cancelCreation() {
    // Réinitialisez le formulaire d'enchère
    this.myForm.reset();
    this.showAddForm=false;
  }
onSubmit() {
  if (this.editMode && this.editForm.valid) {
    const updatedEnchere: Enchere = {
        id: this.editForm.value.id,
        dateFin: this.editForm.value.dateFin,
        dateDebut: this.editForm.value.dateDebut,
        parten: { id: this.editForm.value.parten },
        admin: { id: this.editForm.value.admin },
        // Utilisez l'ID de l'article sélectionné à partir de la liste des articles dans le formulaire
        articles: [{ id: this.editForm.value.articles }]
    };

    if (updatedEnchere.id !== undefined) {
        if (updatedEnchere.articles && updatedEnchere.articles.length > 0 && updatedEnchere.articles[0].id !== undefined) {
            this.encherService.updateEnchere(updatedEnchere.id, updatedEnchere).subscribe(
                (response: any) => {
                    // Utilisez l'ID de l'article sélectionné pour mettre à jour l'enchère
                    this.encherService.updateIdEncherss(updatedEnchere.articles[0].id, response.id).subscribe(
                        () => {
                            this.editForm.reset();
                            this.editMode = false;
                            this.snackBar.open('Enchère mise à jour avec succès!', 'Fermer', { duration: 3000 });
                        },
                        (error: HttpErrorResponse) => {
                            console.error('Erreur lors de la mise à jour des articles :', error);
                            this.snackBar.open('Erreur lors de la mise à jour des articles', 'Fermer', { duration: 3000 });
                        }
                    );
                },
                (error: HttpErrorResponse) => {
                    console.error('Erreur lors de la mise à jour de l\'enchère :', error);
                    this.snackBar.open('Erreur lors de la mise à jour de l\'enchère', 'Fermer', { duration: 3000 });
                }
            );
        } else {
            console.error('L\'ID de l\'article n\'est pas défini.');
        }
    } else {
        console.error('L\'ID de l\'enchère n\'est pas défini.');
    }
}

 else {
        if (this.myForm.valid) {
            const newEnchere: Enchere = {
                id: this.myForm.value.id,
                dateFin: this.myForm.value.dateFin,
                dateDebut: this.myForm.value.dateDebut,
                parten: { id: this.myForm.value.parten },
                admin: { id: this.myForm.value.admin },
                articles: this.myForm.value.articles.map((articleId: number) => ({ id: articleId }))
            };
            this.encherService.addEnchere(newEnchere).subscribe(
                (response: any) => {
                    this.encheres.push(response);
                    this.updateArticle(newEnchere.articles, response.id);
                    this.myForm.reset();
                    this.snackBar.open('Enchère créée avec succès!', 'Fermer', { duration: 3000 });
                },
                (error: HttpErrorResponse) => {
                    console.error('Erreur lors de la création de l\'enchère :', error);
                    this.snackBar.open('Erreur lors de la création de l\'enchère', 'Fermer', { duration: 3000 });
                }
            );
        } else {
            console.error('Utilisateur ou administrateur non trouvé.');
            this.snackBar.open('Utilisateur ou administrateur non trouvé.', 'Fermer', { duration: 3000 });
        }
    }
}

updateArticle(articles: { id: number }[], enchereId: number): void {
  // Vérifier si des articles sont définis avant de mettre à jour
  if (articles && articles.length > 0) {
      // Filtrer les articles avec des IDs non définis ou nuls
      const articlesToUpdate = articles.filter(article => article.id !== null && article.id !== undefined);

      articlesToUpdate.forEach(article => {
          console.log("article id :",article.id);
          // Vérifier si l'ID de l'article est un nombre
          if (typeof article.id === 'number') {
            console.log("article id :",article.id);
              this.encherService.updateIdEnchers(article.id, enchereId).subscribe(
                  () => {
                      console.log('Article mis à jour avec succès!');
                      // Si nécessaire, ajoutez d'autres instructions ici après la mise à jour de l'article
                  },
                  (error: HttpErrorResponse) => {
                      console.error('Erreur lors de la mise à jour de l\'article :', error);
                      this.snackBar.open('Erreur lors de la mise à jour de l\'article', 'Fermer', { duration: 3000 });
                  }
              );
          } else {
              console.error('ID d\'article non défini ou invalide.');
          }
      });
  } else {
      console.error('Aucun article à mettre à jour.');
  }
}
  editEnchere(enchere: Enchere) {
    this.editMode = true;
    this.editForm.patchValue({
      id: enchere.id,
      dateFin: enchere.dateFin,
      dateDebut: enchere.dateDebut,
      parten: enchere.parten.id, // Utilisez l'ID de l'utilisateur au lieu de l'objet complet
      admin: enchere.admin.id, // Utilisez l'ID de l'administrateur au lieu de l'objet complet
      articles: enchere.articles ? enchere.articles.map(article => article.id) : [] // Vérifiez si enchere.articles est défini avant de mapper
    });
  }
  deleteEnchere(id: number) {
    // Appelez le service pour supprimer l'enchère
    this.encherService.deleteEnchere(id).subscribe(
      () => {
        // Supprimez l'enchère de la liste
        this.encheres = this.encheres.filter(enchere => enchere.id !== id);
        // Affichez un message de réussite à l'utilisateur
        this.snackBar.open('Enchère supprimée avec succès!', 'Fermer', {
          duration: 3000
        });
      },
      (error: HttpErrorResponse) => {
        console.error('Erreur lors de la suppression de l\'enchère :', error);
        // Affichez un message d'erreur à l'utilisateur
        this.snackBar.open('Erreur lors de la suppression de l\'enchère', 'Fermer', {
          duration: 3000
        });
      }
    );
  }
 
  cancelEdit() {
    this.editForm.reset();
    this.editMode = false;
  }
  updateEnchere(enchereId: number, updatedEnchere: Enchere): void {
    this.encherService.updateEnchere(enchereId, updatedEnchere).subscribe(
      () => {
        const index = this.encheres.findIndex(enchere => enchere.id === enchereId);
        if (index !== -1) {
          this.encheres[index] = updatedEnchere;
        }
        this.snackBar.open('Enchère mise à jour avec succès!', 'Fermer', { duration: 3000 });
      },
      (error: HttpErrorResponse) => {
        console.error('Erreur lors de la mise à jour de l\'enchère :', error);
        this.snackBar.open('Erreur lors de la mise à jour de l\'enchère', 'Fermer', { duration: 3000 });
      }
    );
  }
  
  
  public currentPath: string | undefined;

  public navigateTo(item: string) {

    this.router.navigate(['/', item]);

  }
}
