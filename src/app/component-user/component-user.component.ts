import { Component, OnInit, OnDestroy} from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { User } from '../model/user';
import { UserService } from '../service/user.service';
import { NotificationService } from '../service/notification.service';
import { NotificationType } from '../enum/notification-type.enum';
import { HttpErrorResponse, HttpEvent, HttpEventType } from '@angular/common/http';
import { NgForm } from '@angular/forms';
import { CustomHttpResponse } from '../model/custom-http-response';
import { AuthenticationService } from '../service/authentication.service';
import { Route, Router } from '@angular/router';
import { Role } from '../enum/role.enum';
import { SubSink } from 'subsink/dist/subsink';

@Component({
  selector: 'app-user',
  templateUrl: './component-user.component.html',
  styleUrls: ['./component-user.component.css']
})
export class ComponentUserComponent implements OnInit, OnDestroy {
  fileStatus: { status: string; percentage: number } = { status: '', percentage: 0 };
  private subs = new SubSink();
  private titleSubject = new BehaviorSubject<string>('Users');
  public titleAction$ = this.titleSubject.asObservable();
  public users: User[] = [];
  public user!: User;
  public refreshing: boolean = false;
  public selectedUser: User = new User();
  public fileName: string | undefined;
  public profileImage: File | undefined;
  private subscriptions: Subscription[] = [];
  public editUser = new User();
  private currentUsername: any;
  constructor(private router: Router,
    private authenticationService: AuthenticationService,
    private userService: UserService,
    private notificationService: NotificationService) { }

  ngOnInit(): void {
    this.user = this.authenticationService.getUserFromLocalCache() || new User();
  if (this.user.lastLoginDateDisplay) {
    this.user.lastLoginDateDisplay = new Date(this.user.lastLoginDateDisplay);
  }
  this.getUsers(true);
  }

  public changeTitle(title: string): void {
    this.titleSubject.next(title);
  }

  public getUsers(showNotification: boolean): void {
  this.refreshing = true;
  this.subs.add()
  this.subscriptions.push(
    this.userService.getUsers().subscribe({
      next: (response: User[]) => {
        response.forEach(u => {
          if (u.lastLoginDateDisplay) {
            u.lastLoginDateDisplay = new Date(u.lastLoginDateDisplay);
          }
        });
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
    }
  ));
}

  public onSelectUser(selectedUser: User): void {
    this.selectedUser = selectedUser;
    this.clickButton('openUserInfo');
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
    this.subs.add()
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

  public onProfileImageChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.profileImage = file;
      this.fileName = file.name;
    }
  }

  public onUpdateUser(): void {
    const formData = this.userService.createUserFormData(this.currentUsername, this.editUser, this.profileImage!);
    this.subscriptions.push(
      this.userService.updateUser(formData).subscribe(
        (response) => {
          this.clickButton('closeEditUserModalButton');
          this.getUsers(false);
          this.fileName = undefined;
          this.profileImage = undefined;
          this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} updated successfully`);
        },
        (error: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, error.error.message);
          this.profileImage = undefined;
        }
      )
    );
  }

  public onResetPassword(emailForm: NgForm): void {
    const emailAddress = emailForm.value['reset-password-email'];
    this.refreshing = true;
    this.subscriptions.push(
      this.userService.resetPassword(emailAddress).subscribe(
        (response: CustomHttpResponse) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          this.refreshing = false;
          emailForm.reset();
        },
        (error: HttpErrorResponse) => {
          this.sendNotification(NotificationType.WARNING, error.error.message);
          this.refreshing = false;
        }
      )
    );
  }
  public triggerImageInput(): void {
    const fileInput = document.getElementById('profile-image-input') as HTMLInputElement;
    fileInput.click();
  }

  public updateProfileImage(): void {
    this.clickButton('profile-image-input');
  }

  public onUpdateProfileImage(): void {
    const formData = new FormData();
    formData.append('username', this.user.username);
    formData.append('profileImage', this.profileImage!);
    this.subscriptions.push(
      this.userService.updateProfileImage(formData).subscribe(
        (event: HttpEvent<any>) => {
          this.reportProfileImage(event);
        },
        (errorResponse: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
          this.fileStatus.status = 'done';
        }
      )
    );
  }

  private reportProfileImage(event: HttpEvent<any>): void {
    switch (event.type) {
      case HttpEventType.UploadProgress:
        if (event.total) {
          this.fileStatus.percentage = Math.round(100 * event.loaded / event.total);
        }
        this.fileStatus.status = 'progress';
        break;

      case HttpEventType.Response:
        if (event.status === 200) {
          this.user.profileImageUrl = `${event.body.profileImageUrl}?time=${new Date().getTime()}`;
          this.sendNotification(NotificationType.SUCCESS, `${event.body.fileName}'s Profile image updated successfully`);
          this.fileStatus.status = 'done';
        } else {
          this.sendNotification(NotificationType.ERROR, 'Unable to upload image. Please try again');
        }
        break;

      default:
        console.log('Finished all processes');
    }
  }


  public onLogOut(): void {
    this.authenticationService.logOut();
    this.router.navigate(['/login']);
    this.sendNotification(NotificationType.SUCCESS, 'You been successfully logged out')
  }

  public onUpdateCurrentUser(user: User): void {
  this.refreshing = true;
  this.currentUsername = this.authenticationService.getUserFromLocalCache()?.username;
  const formData = this.userService.createUserFormData(this.currentUsername, user, this.profileImage!);
  this.subscriptions.push(
    this.userService.updateUser(formData).subscribe(
      (response: User) => {
        if (response.lastLoginDateDisplay) {
          response.lastLoginDateDisplay = new Date(response.lastLoginDateDisplay);
        }
        this.authenticationService.addUserToLocalCache(response);
        this.getUsers(false);
        this.fileName = undefined;
        this.profileImage = undefined;
        this.sendNotification(NotificationType.SUCCESS, `${response.firstName} ${response.lastName} updated successfully`);
      },
      (errorResponse: HttpErrorResponse) => {
        this.sendNotification(NotificationType.ERROR, errorResponse.error.message);
        this.refreshing = true;
        this.profileImage = undefined;
      }
    )
  );
}
  public onEditUser(editUser: User): void {
    this.editUser = editUser;
    this.currentUsername = editUser.username;
    this.clickButton('openUserEdit');

  }

  public searchUsers(searchTerm: string): void {
    const results: User[] = [];
    for (const user of this.userService.getUsersFormLocalCache()) {
      if (user.firstName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.lastName.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.username.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1 ||
        user.userId.toLowerCase().indexOf(searchTerm.toLowerCase()) !== -1) {
        results.push(user);
      }
    }
    this.users = results;
    if (results.length == 0 || !searchTerm) {
      this.users = this.userService.getUsersFormLocalCache();
    }
  }

  public onDeleteUser(username: string): void {
    this.subscriptions.push(
      this.userService.deleteUser(username).subscribe(
        (response: CustomHttpResponse) => {
          this.sendNotification(NotificationType.SUCCESS, response.message);
          this.getUsers(false);
        },
        (error: HttpErrorResponse) => {
          this.sendNotification(NotificationType.ERROR, error.error.message);
        }
      )
    );
  }

  public get isAdmin(): boolean{
    return this.getUserRole() === Role.ADMIN || this.getUserRole() === Role.SUPER_ADMIN;
  }

  public get isManager(): boolean {
    return this.isAdmin || this.getUserRole() === Role.MANAGER;
  }

  public get isAdminOrManager(): boolean {
    return this.isAdmin || this.isManager;
  }

  private getUserRole(): string {
  return this.authenticationService.getUserFromLocalCache()?.role || '';
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

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  } 

}