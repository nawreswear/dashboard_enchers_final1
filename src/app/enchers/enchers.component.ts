import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EnchersServiceService } from '../enchers-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { ArticleService } from '../article.service';
import {  BehaviorSubject, Observable, Subject,of } from 'rxjs';
import { User } from '../interfaces/user';
import { Router } from '@angular/router';
import { AuthService  } from '../_service/auth.service';
import { PartEnService } from '../part-en.service';
import { CookieService } from 'ngx-cookie-service';
interface Enchere {
  id?: number;
  dateDebut: string;
  dateFin: string;
  parten: { id: number };
  admin: { id: number };
  articles: { id: number }[];
}

interface Article {
  id: number;
  titre: string;
  description: string;
  photo: string;
  prixvente?: number;
  prix: string;
 // livrable: boolean;
  statut: string; 
  showPriceForm?: boolean;
 // quantiter: number;

}
let enchereData: Enchere[] = [];
@Component({
  selector: 'app-enchers',
  templateUrl: './enchers.component.html',
  styleUrls: ['./enchers.component.css']
})
export class EnchersuserComponent implements OnInit {
  token = new BehaviorSubject<string | null>(null);
  tokenObs$ = this.token.asObservable();
  article: any;
  userData = new BehaviorSubject<User | null>(null);
  userDataObs$ = this.userData.asObservable();
  selectedEnchereId: number | undefined;
  urlPattern = new RegExp('^(https?:\\/\\/)?'+ // Protocole
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // Nom de domaine
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // Ou une adresse IP (v4) 
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // Port et chemin
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // Paramètres de requête
  '(\\#[-a-z\\d_]*)?$','i'); // Fragment
  currentUser: User | null = null;
  currentUserr: string | undefined;
// Déclaration de la fonction dans la classe de composant
parseDate(dateString: string): number | undefined {
  return parseInt(dateString, 10); // Convertit la chaîne en nombre entier
} // Déclarer le formulaire

  public myForm!: FormGroup;
  public encheres: Enchere[] = []; // Utiliser le bon type Enchere[]
  public loading: boolean = false;
  public articles: Article[] = [];
  public editMode: boolean = false;
  public editForm!: FormGroup;
  public partens: any[] = [];
  public admins: any[] = [];
  public prixVenteForm!: FormGroup;
  public selectedArticleId: number | undefined;
  public showAddPriceForm: boolean = false;

  public showAddForm: boolean = false; 
  public formattedDateDebut!: string;
  public formattedDateFin!: string;
  private unsubscribe$ = new Subject<void>();
  public articlesForEnchere: Article[] = [];
  public articlesForEnchereMap: { [enchereId: number]: Article[] } = {};
 private isLoggedInSubject = new BehaviorSubject<boolean>(false);
 authStatus = this.isLoggedInSubject.asObservable();
  constructor(private cookieService: CookieService,
    private formBuilder: FormBuilder,
    private encherService: EnchersServiceService,
    private snackBar: MatSnackBar,  public router: Router,private authService: AuthService  ,
   private articleService: ArticleService,private partenservice:PartEnService
  ) {
    this.myForm = this.createEnchereForm();
    this.editForm = this.createEnchereForm();
    this.myForm = this.formBuilder.group({
      id: [0],
      dateFin: [new Date()],
      dateDebut: [new Date()],
      parten: ['', Validators.required], 
      admin: ['', Validators.required], 
      articles: this.formBuilder.control([]) 
    });
    this.prixVenteForm = this.formBuilder.group({
      prixvente: ['', Validators.required] 
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
    this.tokenObs$.subscribe(token => {
      if (!token) this.router.navigate(['/']);
    });
    this.prixVenteForm = this.formBuilder.group({
      prixvente: [null, Validators.required] // Initialisez avec null ou une valeur par défaut
    });
}

createEnchereForm(): FormGroup {
  return this.formBuilder.group({
    id: [0],
    dateFin: [new Date()],
    dateDebut: [new Date()],
    parten: ['', Validators.required],
    admin: ['', Validators.required],
    articles: this.formBuilder.control([])
  });
}
public getArticlesForEnchere(enchereId: number): Article[] | undefined {
  if (this.articlesForEnchereMap[enchereId]) {
    // Si les articles pour cette enchère ont déjà été récupérés, les retourner immédiatement
    return this.articlesForEnchereMap[enchereId];
  } else {
    // Sinon, récupérer les articles depuis le service et les stocker dans le dictionnaire
    this.encherService.getArticlesForEnchere(enchereId).subscribe(
      (articles: Article[]) => {
        this.articlesForEnchereMap[enchereId] = articles;
       // console.log("Articles pour l'enchère avec ID", enchereId, ":", this.articlesForEnchereMap[enchereId]);
      },
      (error) => {
        console.error('Une erreur s\'est produite lors de la récupération des articles de l\'enchère avec ID', enchereId, ':', error);
      }
    );
    // Retourner undefined pendant que les articles sont récupérés
    return undefined;
  }
}
getArticlePhoto(articleId: number): string {
  const article = this.articles.find(article => article.id === articleId);
  return article ? article.photo : ''; // Retourne l'URL de la photo de l'article ou une chaîne vide si l'article n'est pas trouvé
}

findUserIdAndParticipateEnchere(enchereId: number) {
  const storedToken = localStorage.getItem('token');
  if (storedToken) {
    console.log("storedTokennnn",storedToken);
    const tokenPayload = JSON.parse(atob(storedToken.split('.')[1]));
    console.log(tokenPayload);
    if (tokenPayload.sub) {
      const username = tokenPayload.sub;
      console.log('Nom utilisateur :', username);
      // Utilisation directe de tokenPayload.sub pour récupérer le nom d'utilisateur
      this.encherService.findUserIdByNom(username).subscribe(
        userId => {
          console.log('ID de l\'utilisateur trouvé :', userId);
          // Call participerEnchere with userId
          this.participerEnchere(userId, enchereId);
        },
        error => {
          console.error('Erreur lors de la recherche de l\'ID de l\'utilisateur :', error);
        }
      );
    } else {
      console.error('Nom utilisateur non trouvé dans le payload du token');
    }
  } else {
    console.error('Token non trouvé dans le stockage local');
  }
}
participerEnchere(userId: number, enchereId: number) {
  this.encherService.participateInEnchere(userId, enchereId).subscribe(
    () => {
      this.cookieService.set('userId', userId.toString());
      const userIdd = parseInt(this.cookieService.get('userId') || '0');
      console.log("ID de l'utilisateur:", userIdd);
      // Mettez à jour les données après la participation à l'enchère
      this.getAllEncheres(); // Met à jour la liste des enchères après la participation
      this.snackBar.open('Vous avez participé à l\'enchère avec succès!', 'Fermer', {
        duration: 3000
      });
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

  ngOnInit() {
    this.getAllEncheres();
    this.getAllArticles();
    this.getAllPartens();
    this.getAllAdmins();
    this.getAllArticles();
    this.encheres.forEach(enchere => {
      // Vérifie si l'ID de l'enchère est défini avant d'appeler la méthode
      if (enchere.id !== undefined) {
        // Appel de la méthode pour récupérer les articles pour chaque enchère
       this.getArticlesForEnchere(enchere.id);
      }
    });
  }

  formatDate(timestamp: number | undefined): string {
    if (!timestamp) return ''; // Si le timestamp est indéfini, retourne une chaîne vide
    const date = new Date(timestamp); // Crée une nouvelle instance de Date à partir du timestamp
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}-${month}-${day}  ${hours}:${minutes}`;
}

isLoggedIn(): boolean {
  return !!this.token.value;
}
getAllEncheres() {
  this.loading = true;
  this.encherService.getAllEncheres().subscribe(
    (encheres: Enchere[]) => {
      this.encheres = encheres;
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
getAllArticles() {
  this.articleService.getAllArticles().subscribe(
    (articles: Article[]) => {
      this.articles = articles;
    },
    (error: HttpErrorResponse) => {
      console.error('Erreur lors de la récupération des articles :', error);
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
        // Gérer les erreurs si nécessaire
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

  getArticleTitle(articleId: number): string {
    const article = this.articles.find(article => article.id === articleId);
    return article ? article.description : ''; // Retourne la description de l'article ou une chaîne vide si l'article n'est pas trouvé
  }
  onCreate() {
    this.showAddForm = true;
    if (this.myForm.valid) {
      const selectedUser = this.partens.find(partens => partens.id === this.myForm.value.parten); // Trouver l'utilisateur correspondant au nom sélectionné
      const selectedAdmin = this.admins.find(admin => admin.nom === this.myForm.value.admin); // Trouver l'administrateur correspondant au nom sélectionné

      if (selectedUser && selectedAdmin) { // Vérifier si l'utilisateur et l'administrateur ont été trouvés
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
      articles: enchere.articles ? enchere.articles.map(article => article) : [] // Vérifiez si enchere.articles est défini avant de mapper
    });
  }
  
  // Méthode pour afficher ou masquer le formulaire d'ajout du prix de vente
toggleAddPriceForm(articleId: number | undefined) {
    if (articleId !== undefined) {
        this.showAddPriceForm = true; // Afficher le formulaire de prix de vente
        this.selectedArticleId = articleId;
    }
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
  isValidURL(url: string): boolean {
    // Expression régulière pour valider les URL
    const urlPattern = new RegExp('^(https?:\\/\\/)?([a-z0-9-]+\\.)+[a-z]{2,}([\\/\\?#].*)?$', 'i');
    return urlPattern.test(url);
  }
  getParticipantId(enchereId: number): Observable<number> {
    return this.partenservice.getPartenIdByEnchere(enchereId);
  }
  addPrixVenteForArticle(enchereId: number, articleId: number) {
    if (this.prixVenteForm.valid) {
      // Obtenez le contrôle de prix de vente du formulaire
      const prixVenteControl = this.prixVenteForm.get('prixvente');
      if (prixVenteControl) {
        // Obtenez la valeur du prix de vente du contrôle
        const prixVenteValue = prixVenteControl.value.toString(); // Convertir en chaîne de caractères
        const prixVente = parseFloat(prixVenteValue.replace(',', '.')); // Assurez-vous que les décimales sont correctement formatées
        
        if (!isNaN(prixVente)) { // Vérifiez si la conversion a réussi
          // Appelez la méthode pour obtenir l'ID du participant
          this.getParticipantId(enchereId).subscribe(
            (participantId: number) => {
              // Appelez le service pour ajouter le prix de vente pour l'article
              this.articleService.addPrixVenteForArticle(enchereId, articleId, prixVente).subscribe(
                () => {
                  // Enregistrez l'ID du participant dans une cookie
                  this.cookieService.set('participantId', participantId.toString());
                // Réinitialisez le formulaire et masquez le formulaire de prix de vente
                  this.prixVenteForm.reset();
                  this.showAddPriceForm = false;

                  // Mettre à jour la liste d'enchères après l'ajout du prix de vente
                  this.updateEncheresAfterPrixVente();
                }, // Utiliser bind pour conserver le contexte de this
                () => {
                  // Affichez un message d'erreur en cas d'échec de l'ajout du prix de vente
                  this.snackBar.open('Le prix de vente a été ajouté avec succès.', 'Fermer', {
                    duration: 3000
                  });
                }
              );
            },
            (error) => {
              console.error("Erreur lors de la récupération de l'ID du participant :", error);
              // Affichez un message d'erreur si la récupération de l'ID du participant échoue
              this.snackBar.open("Erreur lors de la récupération de l'ID du participant.", 'Fermer', {
                duration: 3000
              });
            }
          );
        } else {
          // Affichez un message d'erreur si le prix de vente n'est pas valide
          console.error("La valeur du prix de vente n'est pas un nombre valide :", prixVenteValue);
          this.snackBar.open("Veuillez saisir un prix de vente valide.", 'Fermer', {
            duration: 3000
          });
        }
      }
    } else {
      // Affichez un message d'avertissement si le formulaire de prix de vente n'est pas valide
      console.log("Le formulaire de prix de vente n'est pas valide.");
      this.snackBar.open("Le formulaire de prix de vente n'est pas valide.", 'Fermer', {
        duration: 3000
      });
    }
  }
  updateEncheresAfterPrixVente() {
    // Appelez ici la méthode pour mettre à jour la liste d'enchères après avoir ajouté le prix de vente
    this.getAllEncheres();
  }
}