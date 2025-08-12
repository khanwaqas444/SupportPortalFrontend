import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { User } from '../model/user';
import { UserService } from '../service/user.service';
import { NotificationService } from '../service/notification.service';
import { NotificationType } from '../enum/notification-type.enum';
import { HttpErrorResponse } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { error } from 'console';
import { AuthenticationService } from '../service/authentication.service';
import { CustomHttpResponse } from '../model/custom-http-response';
import { Router } from '@angular/router';

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
  public selectedUser: User = new User();
  public usser : User | undefined;
  public fileName: string | undefined;
  public profileImage: File | undefined;
  private subscriptions: Subscription[] = [];
  public editUser = new User();
  private currentUsername: any;
  public fileStatus: { status: string; percentage: number } | null = null;


   activeTab: string = 'users';
  user: User | null | undefined;

  changeTab(tabName: string) {
    this.activeTab = tabName;
    this.changeTitle(tabName); 
  }

  constructor(private router: Router, private authenticationService: AuthenticationService,
              private userService: UserService, private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalCache();
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
    this.clickButton('openUserInfo');  // Sahi button call
  }


  public onProfileImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input?.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileName = file.name;
      this.profileImage = file;
    }
  }

  public saveNewUser(): void {
    this.clickButton('new-user-close');
  }

  public onAddNewUser(userForm: NgForm): void {
    if (!this.profileImage) {
      this.sendNotification(NotificationType.ERROR, 'Profile image is required.');
      return;
    }

    const formData = this.userService.createUserFormData('', userForm.value, this.profileImage);

    this.subscriptions.push(
      this.userService.addUser(formData).subscribe(
        (response) => {
          this.clickButton('new-user-close');
          this.getUsers(false);
          this.fileName = undefined;
          this.profileImage = undefined;

          userForm.reset();
          this.sendNotification(NotificationType.SUCCESS, '${response.firstName} ${response.lastName} added successfully');
        },
        (error: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, error.error.message);
          this.profileImage = undefined;
        }
      )
    );
  }

  public searchUsers(searchTerm: string): void {
    const results: User[] = [];
    for (const user of this.userService.getUsersFormLocalCache()) {
      if (user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.userName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.userId.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
        results.push(user);
      }
    }
    this.users = results;
    if (results.length == 0 || !searchTerm) {
      this.users = this.userService.getUsersFormLocalCache();
    }
  }

public onUpdateUser(): void {
  const formData = this.userService.createUserFormData(
    this.currentUsername,
    this.editUser,
    this.profileImage!
  );

  this.subscriptions.push(
    this.userService.updateUser(formData).subscribe({
      next: (response) => {
        if (
          response &&
          typeof response == 'object' &&
          'firstName' in response &&
          'lastName' in response
        ) {
          this.clickButton('closeEditUserModalButton'); 
          this.getUsers(false);
          this.fileName = undefined;
          this.profileImage = undefined;

          this.sendNotification(
            NotificationType.SUCCESS,
            `${response.firstName}${response.lastName} updated successfully`
          );
        } else {
          this.sendNotification(NotificationType.ERROR, 'Unexpected response received');
        }
      },
      error: (error: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, error.error.message || 'Something went wrong');
        this.profileImage = undefined;
      }
    })
  );
}


public onUpdateCurrentUser(user: User): void {
  this.refreshing = true;
  this.currentUsername = this.authenticationService.getUserFromLocalCache()?.username;
  const formData = this.userService.createUserFormData(this.currentUsername, user, this.profileImage!);
  this.subscriptions.push(
  this.userService.updateUser(formData).subscribe(
    (response: User) => {
      this.authenticationService.addUserToLocalCache(response);
      this.getUsers(false);
      this.fileName = undefined;
      this.profileImage = undefined;
      this.sendNotification(
    NotificationType.SUCCESS,
    `${response.firstName} ${response.lastName} updated successfully`
  );
},
    (errorResponse: HttpErrorResponse) => {
      this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
      this.refreshing = true;
      this.profileImage = undefined;
    }
  )
);
}

public updateProfileImage(): void {
  this.clickButton('profile-image-input');
}

public onLogOut(): void {
  this.authenticationService.logOut();
  this.router.navigate(['/login']);
  this.sendNotification(NotificationType.SUCCESS, `You've been successfuly logged out`);
}

public onResetPassword(emailForm: NgForm): void {
  this.refreshing = true;
  const emailAdddress = emailForm.value['']; // ⚠️ This also looks incorrect — see below

  this.subscriptions.push(
    this.userService.resetPassword(emailAdddress).subscribe(
      (response) => {
        this.sendNotification(NotificationType.SUCCESS, response.message);
        this.refreshing = false;
      },
      (error: HttpErrorResponse) => {
        this.sendNotification(NotificationType.WARNING, error.error.message);
        this.refreshing = false;
      },
      () => emailForm.reset()
    )
  );
}

public onDeleteUser(userId: number): void {
  this.subscriptions.push(
    this.userService.deleteUser(userId).subscribe(
      (response) => {
        this.sendNotification(NotificationType.SUCCESS, response.message);
        this.getUsers(true);
      },
      (error: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, error.error.message);
      }
    )
  );
}

 public onEditUser(editUser: User): void {
  this.editUser = editUser;
  this.currentUsername = editUser.userName;
this.clickButton('openEditUserModalButton');
}

  public onImgError(event: Event): void {
  (event.target as HTMLImageElement).src = 'assets/fallback-profile.png';
}


  private sendNotification(notificationType: NotificationType, message: string): void {
    if (message) {
      this.notificationService.notify(notificationType, message);
    } else {
      this.notificationService.notify(notificationType, 'An error occurred. Please try again.');
    }
  }

  public getFormattedRole(role: string): string {
    switch (role) {
      case 'ROLE_ADMIN':
        return 'Admin';
      case 'ROLE_MANAGER':
        return 'Manager';
      case 'ROLE_USER':
        return 'User';
      default:
        return role;
    }
  }

  public clickButton(buttonId: string): void {
    document.getElementById(buttonId)?.click();
  }


}
