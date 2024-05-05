import { Component } from '@angular/core';
import { CommentaireService } from '../commentaire.service';
import { ArticleService } from '../article.service';
import { EnchersServiceService } from '../enchers-service.service';
import { PartEnService } from '../part-en.service';
import { ActivatedRoute, Router } from '@angular/router';

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
}

interface Commentaire {
  id: number;
  object: string;
  message: string;
  date: Date;
  user: { id: number }; // Changé en 'id' au lieu de 'userId'
  article: { id: number }; // Modifier le nom de la propriété en articleId
}

@Component({
  selector: 'app-commentaire',
  templateUrl: './commentaire.component.html',
  styleUrls: ['./commentaire.component.css']
})
export class CommentaireComponent {
  commentaires: Commentaire[] = []; 
  commentairess: Commentaire[] = []; 
  articleId: number | undefined;
  selectedArticle: Article | null = null;
  userId: number | undefined; 
  commentaireAModifier: Commentaire | null = null;

  nouveauCommentaire: Commentaire = {
    id: 0,
    object: '',
    message: '',
    date: new Date(),
    article: { id: 0 },
    user: { id: 0 } // Valeur par défaut pour user.id
  };

  constructor(private commentaireService: CommentaireService, private articleService: ArticleService,
    private encherService: EnchersServiceService, public router: Router, private route: ActivatedRoute,
    private partEnService: PartEnService
  ) {

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
            this.userId = userId; // Initialisation de la propriété userId
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
   /* this.route.params.subscribe(params => {
      const articleId = +params['id']; 
      this.articleService.getArticleById(articleId).subscribe(article => {
        this.selectedArticle = article; 
        this.nouveauCommentaire.article.id = article.id; 
        this.getCommentairesPourArticle(this.selectedArticle.id);
        console.log("ccccc",this.getCommentairesPourArticle(this.selectedArticle.id));
      });
    });*/
 
  }

 /* getCommentairesPourArticle(idArticle: number): void {
    this.commentaireService.getCommentairesParIdArticle(idArticle)
      .subscribe(commentairess => {
        this.commentairess = commentairess; 
      });
  }*/
  
  /*ajouterCommentaire() {
    // Afficher l'objet nouveauCommentaire dans la console pour vérifier ses propriétés
    console.log("Nouveau commentaire :", this.nouveauCommentaire);
  
    // Vérifier si userId est défini
    if (this.userId === undefined) {
      console.error("L'identifiant de l'utilisateur est manquant.");
      return;
    }
  
    // Vérifier si selectedArticle est défini
    if (!this.selectedArticle) {
      console.error("Aucun article sélectionné.");
      return;
    }
  
    // Mettre à jour l'ID de l'article dans nouveauCommentaire
    this.nouveauCommentaire.article.id = this.selectedArticle.id;
  
    // Créer un objet Commentaire avec la propriété 'article' et 'user' pour correspondre au type attendu
    const commentaire: Commentaire = {
      id: this.nouveauCommentaire.id,
      object: this.nouveauCommentaire.object,
      message: this.nouveauCommentaire.message,
      date: this.nouveauCommentaire.date,
      article: { id: this.selectedArticle.id },
      user: { id: this.userId }
    };
  
    // Envoyer le commentaire au service
    this.commentaireService.ajouterCommentairePourArticle(this.selectedArticle.id, commentaire).subscribe(
      (data) => {
        this.commentaires.push(data); // Ajouter le nouveau commentaire au tableau
        this.nouveauCommentaire.object = '';
        this.nouveauCommentaire.message = '';
        console.log('Commentaire ajouté avec succès :', data);
      },
      (error) => {
        console.error('Une erreur est survenue lors de l\'ajout du commentaire : ', error);
      }
    );
  }*/
  

  loadArticle(id: number) {
    this.articleService.getArticleById(id).subscribe(
      (data) => {
        // Vous pouvez faire quelque chose avec les données de l'article si nécessaire
      },
      (error) => {
        console.log('Une erreur est survenue lors du chargement de l\'article : ', error);
      }
    );
  }

  setCommentaireAModifier(commentaire: Commentaire) {
    this.commentaireAModifier = commentaire;
  }

  mettreAJourCommentaire() {
    // Mettre à jour le commentaire
  }

  supprimerCommentaire(commentaire: Commentaire) {
    // Supprimer le commentaire
  }
}

