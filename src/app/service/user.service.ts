import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpEvent, HttpResponse } from '@angular/common/http'
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { User } from '../model/user'; 
import { JwtHelperService } from "@auth0/angular-jwt";
import { CustomHttpResponse } from '../model/custom-http-response';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private host = environment.apiUrl;

  constructor(private http: HttpClient) {}

  public getUsers(): Observable<User[]> {
  return this.http.get<User[]>(`${this.host}/user/list`);
}


   public addUser(formData: FormData): Observable<User | HttpErrorResponse> {
    return this.http.post<User>('${this.host}/user/add',formData);
  } 
  
  public updateUser(formData: FormData): Observable<User| HttpErrorResponse> {
    return this.http.post<User>('${this.host}/user/update',formData);
  } 

  public resetPassword(email: string): Observable<CustomHttpResponse | HttpErrorResponse> {
    return this.http.get<CustomHttpResponse>('${t his.host}/user/resetPassword/${email}');
  } 

  public updateProfileImage(formData: FormData): Observable<HttpEvent<User> | HttpErrorResponse> {
    return this.http.post<User>('${this.host}/user/updateProfileImage',formData,{reportProgress: true,
      observe: 'events'});
  }

   public deleteUser(userId: Number): Observable<CustomHttpResponse | HttpErrorResponse> {
    return this.http.delete<CustomHttpResponse>('${this.host}/user/delete/${userId}'
    );
  }
  
  public addUsersToLocalCache(users: User[]): void {
    localStorage.setItem('users',JSON.stringify(users));
  }

  public getUsersFormLocalCache(): User[] {
  const usersJson = localStorage.getItem('users');
  return usersJson ? JSON.parse(usersJson) as User[] : [];
}


  public createUserFormDate(loggedInUsername: string, user: User, profileImage: File): FormData {
    const formData = new FormData();
    formData.append('currentUsername', loggedInUsername);
    formData.append('firstName', user.firstName);
    formData.append('lastName', user.lastName);
    formData.append('email', user.email);
    formData.append('role', user.role);
    formData.append('profileImage', profileImage);
    formData.append('isActive', JSON.stringify(user.active));
    formData.append('isNonLocked', JSON.stringify(user.notLocked));
    formData.append('profileImage', profileImage);
    formData.append('lastName', user.lastName);
    return formData;

  }
}
