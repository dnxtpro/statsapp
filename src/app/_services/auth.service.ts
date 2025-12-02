import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';
import { StorageService } from './storage.service';

const AUTH_API = `${environment.apiUrl}/api/auth/`;

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
  withCredentials: true,
};

@Injectable({ 
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient,private storageService: StorageService) {}

  private getHttpOptions() {
    const token = this.storageService.getToken();
    return {
      headers: new HttpHeaders({ 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signin',
      {
        username,
        password,
      },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    ).pipe(
      tap((response: any) => {
        if (response.token) {
          this.storageService.saveToken(response.token);
        }
      })
    );
  }

  register(username: string, email: string, password: string, roles: string): Observable<any> {
    return this.http.post(
      AUTH_API + 'signup',
      {
        username,
        email,
        password,
        roles,
      },
      { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) }
    );
  }


  logout(): Observable<any> {
    return this.http.post(AUTH_API + 'signout', {}, this.getHttpOptions()).pipe(
      tap(() => {
        this.storageService.clean();
      })
    );
  }
}