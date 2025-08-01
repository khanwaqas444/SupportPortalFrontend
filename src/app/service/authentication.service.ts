import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http'
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../model/user'; 
import { JwtHelperService } from "@auth0/angular-jwt";

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

 public host = environment.apiUrl;
 private token: string = '';
 private loggedInUsername: string = '';
 private JwtHelper = new JwtHelperService();

  constructor(private http: HttpClient) {}

   login(user: User): Observable<HttpResponse<User>> {
  return this.http.post<User>(`${this.host}/user/login`, user, {
    observe: 'response'
  });
}

  public register(user: User): Observable<User> {
  return this.http.post<User>(
    `${this.host}/user/register`, user,);
}

  public logOut(): void {
    this.token = 'null';
    this.loggedInUsername = 'null';
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('users');
  }

  public saveToken(token: string): void {
    this.token = token;
    localStorage.setItem('token',token);
  }

  public addUserToLocalCache(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  public getUserFromLocalCache(): User | null {
  const userJson = localStorage.getItem('user');
  if (userJson) {
    return JSON.parse(userJson);
  }
  return null; 
}

  public loadToken(): void {
  this.token = localStorage.getItem('token') ?? '';
}


  public getToken(): string {
    return this.token;
  }

  public isLoggedIn(): boolean {
  this.loadToken();
  if(this.token != null && this.token !== ''){
    if(this.JwtHelper.decodeToken(this.token).sub != null || ''){
      if(!this.JwtHelper.isTokenExpired(this.token)){
        this.loggedInUsername = this.JwtHelper.decodeToken(this.token).sub;
        return true;
      }
    }
  } else {
    this.logOut();
    return false;
  }
  return false;
}
} 
