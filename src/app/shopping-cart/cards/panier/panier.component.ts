import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Panier, PanierService, PartEn } from '../panier.service';
import { ArticleService } from 'src/app/article.service';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { User } from 'src/app/_service/user';

@Component({
  selector: 'app-panier',
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.css']
})
export class PanierComponent implements OnInit {
  @Input() panier: Panier = {} as Panier;
  idRequis: number;
  userId: number | null = null;
 // userId$: Observable<User | null> = this.getUserIdObservable();
  token = new BehaviorSubject<string | null>(null);
  tokenObs$ = this.token.asObservable();
  collapsed: boolean = true;
  parten: any | null = null;

  constructor(private panierService: PanierService, private articleService: ArticleService,
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


  @Input() ArticleAdded: any;

  ngOnInit() {
    this.getLignePanierDetails();
  }

  getLignePanierDetails() {
    // Fetch details of lignePanier here
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
        // Traitez la réponse comme vous le souhaitez, par exemple mettre à jour l'affichage ou afficher un message de confirmation.
      },
      (error) => {
        console.error('Une erreur s\'est produite lors de la suppression de l\'article du panier :', error);
        // Traitez l'erreur comme vous le souhaitez, par exemple afficher un message d'erreur à l'utilisateur.
      }
    );
  }
  // Call the addPanier method here
 /* addToPanier() {
    // Create a new Panier object with necessary data
    const panier: Panier = {
      id: 0,
      totalP: 0,
      quantitecde:0,
      date: new Date(), // Assign a valid Date object here
      paiements: [],
      articles: [], // Assign null or an instance of Lignepanier
      partEn: null // Assign null or an instance of PartEn
    };
  
    // Call the addPanier method from the PanierService
    this.panierService.addPanier(panier).subscribe(
      (response) => {
        // Handle successful response here
      },
      (error) => {
        // Handle error here
      }
    );
  }*/
}
  
/*checkoutProduct() {
    this.makePayment(this.total, this.lignePanier);
  }
  makePayment(total: number, articles: Lignepanier[]) {
    // Souscrire à getUserIdObservable() pour obtenir le user
    this.getUserIdObservable().subscribe((user: User | null) => {
        const panier: Panier = {
            id: 0,
            TotalP: total,
            date: new Date(),
            paiements: [], // Aucun paiement initial
            lignepanier: articles[0], // Par exemple, si vous avez besoin du premier élément de la liste
            parten: this.parten // Utilisation de la variable 'parten' pour résoudre l'erreur
        };

        // Appeler la méthode addPanier du service PanierService
        this.panierService.addPanier(panier).subscribe((response) => {
            console.log("Panier ajouté avec succès :", response);
            // Vous pouvez gérer la réponse ici
        }, (error) => {
            console.error("Erreur lors de l'ajout du panier :", error);
            // Vous pouvez gérer l'erreur ici
        });
    });
}*/