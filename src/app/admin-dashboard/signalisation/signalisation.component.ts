import { Component, OnInit, ViewChild } from '@angular/core';
import { User } from 'src/app/_service/user';
import {  SignalementService } from 'src/app/signalement.service';
import { UserServiceService } from '../user-service.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
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
  showAlert: boolean = false; 
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  users: MatTableDataSource<User> = new MatTableDataSource<User>();
  constructor(private signalementService: SignalementService,private userService: UserServiceService) { }

  ngOnInit(): void {
    this.getAllSignalements();
    this.userService.getAllUsers().subscribe(
      (data: User[]) => {
        this.users = new MatTableDataSource<User>(data);
        this.users.paginator = this.paginator;
        this.users.sort = this.sort;
      },
      (error: any) => { 
        console.error("Une erreur est survenue lors de la récupération des utilisateurs :", error);
      }
    );
  }
  hideAlert(): void {
    this.showAlert = false;
}
deleteUser(userId: string) {
  this.userService.deleteUser(userId).subscribe((res) => {
    console.log(res);
    const data = this.users.data.filter(
      (item: User) => item.id !== userId
    );
    this.users.data = data;
    this.users.paginator = this.paginator;
    this.users.sort = this.sort;
       
  });
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
  deleteSignalement(id: number) {
    this.signalementService.deleteSignalement(id).subscribe(
      () => {
        console.log('Signalement supprimé avec succès.');
       // this.deleteUser();
        // Mettez à jour la liste des signalements après la suppression
        this.refreshSignalement();
      },
      (error) => {
        console.error('Erreur lors de la suppression du signalement :', error);
        // Gérer les erreurs si nécessaire
      }
    );
  }
  refreshSignalement(): void {
    this.signalementService.getAllSignalements().subscribe(
      signalements => {
        this.signalements = signalements;
        // Vous pouvez ajouter d'autres opérations ici si nécessaire, comme la mise à jour de l'affichage
      },
      error => {
        console.error("Erreur lors de la récupération des signalements :", error);
      }
    );
  }
}
