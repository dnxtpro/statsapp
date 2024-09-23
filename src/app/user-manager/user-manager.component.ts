import { Component,OnInit } from '@angular/core';
import { UserService } from '../_services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-manager',
  templateUrl: './user-manager.component.html',
  styleUrl: './user-manager.component.css'
})
export class UserManagerComponent implements OnInit{
  users:any[]=[]
  roles:any[]=[]
  showRoleSelector: { [key: number]: boolean } = {}; // Controla cuándo mostrar el selector para cada usuario
  selectedRoles: { [key: number]: any } = {}; // Guarda los roles seleccionados para cada usuario
  switchStates: { [key: number]: boolean } = {}; 
  constructor(private userService:UserService,private router:Router){}
  ngOnInit(): void {
    this.getUsers()
  }
  getUsers(){
    this.userService.getAllUsers().subscribe(
      {
        next: data => {
           console.log(data)
           this.users=data;
           this.roles = this.users.map(user => user.roles).flat();
           console.log(this.roles)

        },
        error: err => {console.log(err)
        }
      })
  }
  saveRoles(userId: number) {
    // Crear un array con los roles seleccionados
    const roles: any[] = [];
    if (this.selectedRoles[userId]['admin']) roles.push('admin');
    if (this.selectedRoles[userId]['entrenador']) roles.push('entrenador');
    if (this.selectedRoles[userId]['user']) roles.push('user');

    // Llamar al método updateRoles con el array de roles seleccionados
    this.updateRoles(userId, roles);
  }
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toUTCString(); // Esto formatea la fecha según la configuración local del navegador
  }
  updateRoles(userId: number, roles: any[]) {
    this.userService.updateRole(userId, roles)
      .subscribe(response => {
        console.log('Roles actualizados', response);
        this.showRoleSelector[userId] = !this.showRoleSelector[userId];
        this.switchStates[userId] = false;
        this.getUsers();
      });
  }
toggleRoleSelector(userId: number) {
  console.log(userId)
  if (!this.selectedRoles[userId]) {
    this.selectedRoles[userId] = {
      admin: false,
      entrenador: false,
      user: false
    };
  }
  this.showRoleSelector[userId] = !this.showRoleSelector[userId];
}
}
