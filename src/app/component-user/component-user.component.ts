import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from '../model/user';
import { UserService } from '../service/user.service';
import { NotificationService } from '../service/notification.service';
import { NotificationType } from '../enum/notification-type.enum';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-user',
  templateUrl: './component-user.component.html',
  styleUrls: ['./component-user.component.css']
})
export class ComponentUserComponent implements OnInit {

  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable();
  public users: User[] = [];
  public refreshing: boolean = false;
  public selectedUser: User = new User;
  private subscriptions: Subscription[] = [];
  NotificationService: any;

  constructor(private userService: UserService, private notificationService: NotificationService) { }

  
  ngOnInit(): void {
    this.getUsers(true);
  } 

  public changeTitle(title: string): void {
    this.titleSubject.next(title);
  }

 public getUsers(showNotification: boolean): void {
  this.refreshing = true;
  this.subscriptions.push(
    this.userService.getUsers().subscribe({
      next: (response: User[]) => {
        this.userService.addUsersToLocalCache(response);
        this.users = response;
        this.refreshing = false;
        if (showNotification) {
          this.sendNotification(NotificationType.SUCCESS, `${response.length} user(s) loaded successfully.`);
        }
      },
      error: (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        this.refreshing = false;
      }
    })
  );
}

public onSelectUser(selectedUser: User): void {
  this.selectedUser = selectedUser;
  document.getElementById('openUserInfo')?.click();
}


  private  sendNotification(NotificationType: NotificationType, message: string): void {
      if (message) {
        this.NotificationService.notify(NotificationType, message);
      } else {
        this.NotificationService.notify(NotificationType, 'An error occured. Please try again.')
      }
    }

}
