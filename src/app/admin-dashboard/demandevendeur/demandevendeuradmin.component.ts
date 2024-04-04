import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable,catchError,map,of, switchMap } from 'rxjs';
import { AuthService } from 'src/app/_service/auth.service';
import { demandevendeurService } from 'src/app/vendeur-dashboard/demandevendeur.service';

interface demande_Vendeur {
  id: number| undefined;
  datedem: Date;
  etatdem: boolean;
  //user: { id: number | undefined, nom?: string,prenom?: string,type?: string};
  user: {
    id: number | undefined;
    nom?: string;
    prenom?: string;
    type?: string;
  };
  userId: number;
}


@Component({
  selector: 'app-demandevendeuradmin',
  templateUrl: './demandevendeuradmin.component.html',
  styleUrls: ['./demandevendeuradmin.component.css']
})
export class DemandevendeurAdminComponent implements OnInit {
  demandesvendeurs: demande_Vendeur[] = [];
  vendorForm: FormGroup;
  activeRoute: string = '';
  userDetails: any; // Déclarer la variable userDetailserror: any // Définir le type d'erreur comme 'any'
  userEmail: string | null = null;
demande: any;
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authservice: AuthService, private http: HttpClient,
    private serviceDemandeVendeur: demandevendeurService
  ) {
    this.vendorForm = this.fb.group({
      datedem: ['', Validators.required],
      etatdem: ['', [Validators.required]],
      user: [undefined, [Validators.required]],
    });
  }

  ngOnInit() {
    this.route.url.subscribe(url => {
      this.activeRoute = url[0].path;
     
    });
    this.chargerVendeursEnAttente();
    console.log("avanttttccc", this.chargerVendeursEnAttente());

    console.log("avantttt",this.demandesvendeurs);
    this.loadUserNames(this.demandesvendeurs);
    console.log("aperessss",this.loadUserNames(this.demandesvendeurs));
 
  }
  recevoirDonneesVendeur(vendeur: any) {
    console.log('Données du vendeur reçues :', vendeur);
  }
  chargerVendeursEnAttente() {
    this.serviceDemandeVendeur.getAllDemandeVendeurs().subscribe(
      (demandes: any[]) => {
        this.demandesvendeurs = demandes;
        // Pour chaque demande de vendeur, récupérez les détails de l'utilisateur
        this.demandesvendeurs.forEach(demande => {
          // Vérifiez si l'ID de la demande est défini
          if (demande.id !== undefined) {
            this.getDemandeVendeurById(demande.id).subscribe(
              (demandeVendeur: any) => {
                // Vérifiez si demandeVendeur.user existe avant de l'assigner à demande.user
                if (demandeVendeur.user) {
                  demande.user = { id: demandeVendeur.user.id };
                } else {
                  console.error("L'utilisateur de la demande de vendeur n'est pas défini.");
                }
              },
              error => {
                console.error("Une erreur s'est produite lors de la récupération de la demande de vendeur :", error);
              }
            );
          } else {
            console.error("L'ID de la demande de vendeur est indéfini.");
          }
        });
      },
      error => {
        console.error("Une erreur s'est produite lors de la récupération des demandes de vendeur :", error);
      }
    );
}

  getDemandeVendeurById(id: number): Observable<any> {
    return this.serviceDemandeVendeur.getDemandeVendeurById(id);
  }
  loadUserNames(demandes: demande_Vendeur[]) {
    demandes.forEach(demande => {
      if (demande.user && demande.user.id) {
        console.log("avant", demande.user.id);
        this.getUserById(demande.user.id.toString()).subscribe(
          userData => {
            demande.user.nom = userData.nom;
            console.log("xxxxxxxxxx", demande.user.nom);
          },
          error => {
            console.error("Une erreur s'est produite lors de la récupération du nom d'utilisateur :", error);
          }
        );
      }
    });
  }
getUserById(userId: string): Observable<any> {
  return this.http.get<any>(`http://localhost:3003/getUserById/${userId}`); 
}
getUserIdByName(userName: string): Observable<number> {
  return this.http.get<number>(`http://localhost:3003/getUserIdByName/${userName}`);
}
updateUserType(userId: number): Observable<any> {
  return this.http.put(`http://localhost:3003/users/updateType/${userId}`, null);
}

updateDemandeEtat(id: number, nouvelEtat: boolean): Observable<any> {
  // Construire l'objet de données à envoyer au backend pour la mise à jour
  const data = {
    nouvelEtat: nouvelEtat // Mettre à jour l'état avec le nouvel état
  };
  // Envoyer la requête HTTP PUT pour mettre à jour l'état de la demande
  return this.http.put<any>(`http://localhost:3002/demandesvendeurs/${id}/etat`, data);
}

approuverDemande(demande: demande_Vendeur): Observable<boolean> {
  if (demande.user && demande.user.nom) {
    console.log('ID de l\'utilisateur correspondant :', demande.user.nom);
    return this.getUserIdByName(demande.user?.nom).pipe(
      switchMap((userId: number) => {
        // Mettre à jour le type de l'utilisateur à "vendeur"
        return this.updateUserType(userId).pipe(
          switchMap(() => {
            console.log('Type d\'utilisateur mis à jour avec succès.');
            // Mettre à jour l'état de la demande à "approuvé"
            if (demande.id !== undefined) {
              return this.updateDemandeEtat(demande.id, true).pipe(
                map(() => {
                  console.log('État de la demande mis à jour avec succès.');
                  // Retourner true si tout s'est bien passé
                  return true;
                }),
                catchError(error => {
                  console.error('Une erreur est survenue lors de la mise à jour de l\'état de la demande :', error);
                  // Retourner false en cas d'erreur
                  return of(false);
                })
              );
            } else {
              console.error('L\'ID de la demande de vendeur est indéfini.');
              // Retourner false si l'ID de la demande est indéfini
              return of(false);
            }
          }),
          catchError(error => {
            console.error('Une erreur est survenue lors de la mise à jour du type d\'utilisateur :', error);
            // Retourner false en cas d'erreur
            return of(false);
          })
        );
      }),
      catchError(error => {
        console.error('Une erreur est survenue lors de la récupération de l\'ID de l\'utilisateur :', error);
        // Retourner false en cas d'erreur
        return of(false);
      })
    );
  } else {
    console.error('L\'ID de l\'utilisateur dans la demande de vendeur est indéfini.');
    // Retourner false si l'ID de l'utilisateur est indéfini
    return of(false);
  }
}

public deleteDemandeVendeur(id: number): Observable<void> {
  return this.http.delete<void>(`http://localhost:3002/demandesvendeurs/${id}`);
}
rejeterVendeur(vendeur: demande_Vendeur): void {
  if (vendeur && vendeur.id) {
    const vendeurId = vendeur.id;
    this.deleteDemandeVendeur(vendeurId).subscribe(
      () => {
        console.log('Le vendeur a été rejeté avec succès.');
  
        // Ajoutez d'autres actions si nécessaire après le rejet du vendeur
      },
      (error) => {
        console.error('Une erreur s\'est produite lors du rejet du vendeur :', error);
        // Gérez l'erreur si nécessaire
      }
    );
  } else {
    console.error('Impossible de rejeter le vendeur : ID de vendeur non spécifié.');
  }
}

  navigateTo(item: string) {
    this.router.navigate(['/', item]);
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
}
