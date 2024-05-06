import { Component, OnInit } from '@angular/core';
import { Message, MessageService } from '../message.service';
import { AuthService } from '../_service/auth.service';
import { User } from '../_service/user';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  messages: Message[] = [];

  constructor(private messageService: MessageService ,  public authService: AuthService) { }

  ngOnInit(): void {
    this.getMessages();
  }

  getMessages(): void {
    this.messageService.getMessages()
      .subscribe(messages => {
        this.messages = messages;
        this.messages.forEach(message => {
          this.getUserPhoto(message.user);
        });
      });
  }
  
  getUserPhoto(user: User): void {
    const nom = user.nom; // Assurez-vous que cette propriété est correcte
    if (nom !== null) {
      this.authService.getPhotoByName(nom).subscribe(
        (photoUrl: string) => {
          user.photo = photoUrl;
        },
        (error: any) => {
          console.error('Erreur lors de la récupération de l\'URL de l\'image:', error);
        }
      );
    } else {
      console.error('La valeur de user.nom est null. Impossible de récupérer l\'URL de l\'image.');
    }
  }
  
  // Méthode pour vérifier si une URL est valide
  isValidURL(url: string): boolean {
    const urlPattern = new RegExp('^(https?:\\/\\/)?([a-z0-9-]+\\.)+[a-z]{2,}([\\/\\?#].*)?$', 'i');
    return urlPattern.test(url);
  }
  
  deleteMessage(id: number): void {
    this.messageService.deleteMessage(id)
      .subscribe(() => {
        this.messages = this.messages.filter(message => message.id !== id);
      });
  }
}
