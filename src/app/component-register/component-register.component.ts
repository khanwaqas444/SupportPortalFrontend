import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from '../service/authentication.service';
import { NotificationService } from '../service/notification.service';
import { User } from '../model/user';
import { Subscription } from 'rxjs';
import { HttpErrorResponse} from '@angular/common/http';
import { NotificationType } from '../enum/notification-type.enum';

@Component({
  selector: 'app-component-register',
  templateUrl: './component-register.component.html'
})
export class ComponentRegisterComponent implements OnInit, OnDestroy {
  public showLoading: boolean | undefined;
  private subscriptions: Subscription[] = [];

  constructor(private router: Router, private authenticationService: AuthenticationService,
    private NotificationService: NotificationService) { }

  ngOnInit(): void {
    if (this.authenticationService.isLoggedIn()) {
      this.router.navigateByUrl('/user/management');
    }
  }

  public onRegister(user: User): void {
    this.showLoading = true;
    console.log(user);
    this.subscriptions.push(
    this.authenticationService.register(user).subscribe({
    next: (response: User) => {
    this.showLoading = false;
    this.sendNotification(NotificationType.SUCCESS,`A new account was created for ${response.firstName}. 
      Please check your email for password to log in.`
);

  },
  error: (errorResponse: HttpErrorResponse) => {
    this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
    this.showLoading = false;
  
    }
  }    ));
}

 private  sendNotification(NotificationType: NotificationType, message: string): void {
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
