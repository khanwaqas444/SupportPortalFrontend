import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';
import { User } from '../model/user';
import { Subscription } from 'rxjs';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { NotificationType } from '../enum/notification-type.enum';

@Component({
  selector: 'app-component-login',
  templateUrl: './component-login.component.html',
  styleUrls: ['./component-login.component.css']
})
export class ComponentLoginComponent implements OnInit, OnDestroy {
  public showLoading: boolean | undefined;
  private subscriptions: Subscription[] = [];

  constructor(private router: Router, private authenticationService: AuthenticationService,
    private NotificationService: NotificationService) { }

  ngOnInit(): void {
    if (this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl('/user/management');
    } else {
      this.router.navigateByUrl('login');
    }
  }

  public onLogin(user: User): void {
    this.showLoading = true;
    this.subscriptions.push(
      this.authenticationService.login(user).subscribe({
  next: (response: HttpResponse<User>) => {
    const token = response.headers.get('HeaderType.JWT_TOKEN');
    if (token) {
      this.authenticationService.saveToken(token);
    }

    const user = response.body;
    if (user) {
      this.authenticationService.addUserToLocalCache(user);
    }

    this.router.navigateByUrl('/user/management');
    this.showLoading = false;
  },
  error: (errorResponse: HttpErrorResponse) => {
    this.sendErrorNotification(NotificationType.ERROR, errorResponse.error.message);
    this.showLoading = false;
  
    }
  }    ));
}

 private  sendErrorNotification(NotificationType: NotificationType, message: string): void {
    if (message) {
      this.NotificationService.notify(NotificationType, message);
    } else {
      this.NotificationService.notify(NotificationType, 'An error occured. Please try again.')
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

}
