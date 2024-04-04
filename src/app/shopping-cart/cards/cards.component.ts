import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { ArticleService } from 'src/app/article.service';
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
selector: 'app-cards',
templateUrl: './cards.component.html',
styleUrls: ['./cards.component.css']
})
export class CardsComponent implements OnInit {
articles: Article[] = [];
categories: Categorie[] =[];
productOrders : any[]= [];
@Output() ArticleAdded = new EventEmitter();

addArticleToCart(article:any) {
this.ArticleAdded.emit(article);

}

constructor(private artserv:ArticleService) {}
ngOnInit() {
this.loadArticles();
}

loadArticles() {
this.artserv.getAllArticles()
.subscribe({
next: (articles: any) => {
this.articles = articles;
this.articles.forEach(product => {
this.productOrders.push({article:articles,quantiter:0});
})
},
error: (e) => {
console.log(e);
},
});
}
}