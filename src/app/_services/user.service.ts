import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:4001/api/test/';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}

  getPublicContent(): Observable<any> {
    return this.http.get(API_URL + 'all', { responseType: 'text' });
  }

  getUserBoard(): Observable<any> {
    return this.http.get(API_URL + 'user', { responseType: 'text' });
  }
  
  getModeratorBoard(): Observable<any> {
    return this.http.get(API_URL + 'mod', { responseType: 'text' });
  }

  getAdminBoard(): Observable<any> {
    return this.http.get(API_URL + 'admin', { responseType: 'text' });
  }
  getAllUsers():Observable<any>{
    return this.http.get('http://localhost:4001/api/users/getAll')
  }
  assignUserToPlayer(userId:number,playerId:number):Observable<any>{
    return this.http.put('http://localhost:4001/api/users/assignUserToPlayer',{userId,playerId})
  }
  updateRole(userId:number,roles:any[]){
    return this.http.put(`http://localhost:4001/api/users/updaterole/${userId}`,{roles})
  }
}