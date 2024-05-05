import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/_service/user';
import {  SignalementService } from 'src/app/signalement.service';
export interface Signalement {
  id: number;
  message: string;
  date: Date;
  user: User;
  users: User[];
  type: string;
}
@Component({
  selector: 'app-signalisation',
  templateUrl: './signalisation.component.html',
  styleUrls: ['./signalisation.component.css']
})
export class SignalisationComponent implements OnInit {
  signalements: Signalement[] = [];
  photoUrl: string = '';
  constructor(private signalementService: SignalementService) { }

  ngOnInit(): void {
    this.getAllSignalements();

  }

  getAllSignalements(): void {
    this.signalementService.getAllSignalements().subscribe(
      signalements => {
        this.signalements = signalements;
      },
      error => {
        console.error('Erreur lors de la récupération des signalements :', error);
      }
    );
  }

}
