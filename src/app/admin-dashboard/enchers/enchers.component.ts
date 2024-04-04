import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ArticleService } from '../article.service';
import {  Observable, Subject } from 'rxjs';
import { EnchereService } from '../enchers-service.service';

import { Router } from '@angular/router';
import { ci } from '@fullcalendar/core/internal-common';
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
  private unsubscribe$ = new Subject<void>();

  constructor(
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
      articles: this.formBuilder.control([]) 
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

    return `${year}-${month}-${day}T${hours}:${minutes}`;
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
  getAllEncheres() {
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
        /*this.addPartEn({ id: 1 }).subscribe(() => {
        });*/
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
    if (this.editMode) {
      if (this.editForm.valid) {
        const updatedEnchere: Enchere = {
          id: this.editForm.value.id,
          dateFin: this.editForm.value.dateFin,
          dateDebut: this.editForm.value.dateDebut,
          parten: { id: this.editForm.value.parten },
          admin: { id: this.editForm.value.admin },
          articles: this.editForm.value.articles.map((article: any) => ({ id: article }))
        };
        if (updatedEnchere.id !== undefined) {
          this.encherService.updateEnchere(updatedEnchere.id, updatedEnchere).subscribe(
            () => {
              const index = this.encheres.findIndex(enchere => enchere.id === updatedEnchere.id);
              if (index !== -1) {
                this.encheres[index] = updatedEnchere;
              }
              this.editForm.reset();
              this.editMode = false;
              this.snackBar.open('Enchère mise à jour avec succès!', 'Fermer', { duration: 3000 });
          },
            (error: HttpErrorResponse) => {
              console.error('Erreur lors de la mise à jour de l\'enchère :', error);
              this.snackBar.open('Erreur lors de la mise à jour de l\'enchère', 'Fermer', { duration: 3000 });
            }
          );
        } else {
          console.error('ID de l\'enchère non défini.');
        }
      }
    } else {
      // Si le mode édition n'est pas activé, créez une nouvelle enchère
      if (this.myForm.valid) {
        const newEnchere: Enchere = {
          id: this.myForm.value.id,
          dateFin: this.myForm.value.dateFin,
          dateDebut: this.myForm.value.dateDebut,
          parten: { id: this.myForm.value.parten },
          admin: { id: this.myForm.value.admin },
          articles: this.myForm.value.articles.map((article: any) => ({ id: article.id }))
        };
  
        this.encherService.addEnchere(newEnchere).subscribe(
          (response: any) => {
            // Ajoutez la nouvelle enchère à la liste des enchères
            this.encheres.push(response);
            // Réinitialisez le formulaire
            this.myForm.reset();
            // Affichez un message de succès à l'utilisateur
            this.snackBar.open('Enchère créée avec succès!', 'Fermer', {
              duration: 3000
            });
          },
          (error: HttpErrorResponse) => {
            console.error('Erreur lors de la création de l\'enchère :', error);
            // Affichez un message d'erreur à l'utilisateur
            this.snackBar.open('Erreur lors de la création de l\'enchère', 'Fermer', {
              duration: 3000
            });
          }
        );
      }
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
    // Réinitialisez le formulaire d'édition
    this.editForm.reset();
    // Passez en mode non édition
    this.editMode = false;
  }
  public links: any = [
    {
      title: 'Dashboard',
      items: [
        {
          name: 'overview',
          icon: 'fa-solid fa-house',
        }, {
          name: 'billboards',
          icon: 'fa-brands fa-bandcamp',
        }
      ],
    },

    {
      title: 'Pages',
      items: [
        {
          name: 'users',
          icon: 'fa-solid fa-users',
        }, {
          name: 'enchers',
          icon: 'fa-solid fa-bag-shopping',
        },
        {
          name: 'categorie',
          icon: 'fa-solid fa-dumpster-fire',
        },
        {
          name: 'article',
          icon: 'fa-solid fa-dumpster-fire',
        },
        {
          name: 'demande-vendeur',
          icon: 'fa-solid fa-users',
        },
        {
          name: 'commentaire',
          icon: 'fa-solid fa-comment',
        },
       {
          name: 'tags',
          icon: 'fa-solid fa-tag'
        }
      ],
    },

  ];

 

// [routerLink]="['/', item.name]
  public currentPath: string | undefined;

  public navigateTo(item: string) {

    this.router.navigate(['/', item]);

  }
}
