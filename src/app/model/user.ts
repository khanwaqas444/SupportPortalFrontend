export class User {
  public id: number = 0;
  public userId: string = '';
  public firstName: string = '';
  public lastName: string = '';
  public username: string = '';
  public email: string = '';
  public lastLoginDateDisplay: Date | null = null;   // 👈 bas isi ko use karna hai
  public joinDate: Date = new Date();
  public profileImageUrl: string = '';
  public active: boolean = false;
  public notLocked: boolean = false;
  public role: string = '';
  public authorities: string[] = [];  

  constructor() {
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.active = false;
    this.notLocked = false;
    this.role = '';
    this.authorities = [];
  }
}