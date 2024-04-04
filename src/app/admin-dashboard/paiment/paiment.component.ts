import { Component, OnInit } from '@angular/core';
import { PaiementService } from '../paiment.service';
import { User } from 'src/app/interfaces/user';
interface Paiement {
  id: number;
  montant: number;
  statut: string;
  date: Date;
  panier: Panier;
}
interface Panier {
  id: number;
  totalP: number;
  date: Date;
  user: User;
  lignepanier: LignePanier;
}
export interface LignePanier {
  id: number;
  quantiteCommandee: number;
  article: Article;
}
interface Article {
  id: number; 
  titre: string;
  description: string;
  photo: string;
  prix:string;
  prixvente:string;
  livrable:boolean;
  statut:string;
  quantiter:number;
  //categorie: Categorie;
}
@Component({
  selector: 'app-paiment',
  templateUrl: './paiment.component.html',
  styleUrls: ['./paiment.component.css']
})
export class PaimentComponent implements OnInit {
  paiements: Paiement[] = [];

  constructor(private paimentService: PaiementService) { }

  ngOnInit(): void {
    this.getAllPaiements();
  }

  getAllPaiements(): void {
    this.paimentService.getAllPaiements().subscribe(
      (paiements: Paiement[]) => {
        this.paiements = paiements;
      },
      (error) => {
        console.error('Erreur lors de la récupération des paiements :', error);
      }
    );
  }
}
