export class User {
  public id: number = 0;
  public userId: string = '';
  public firstName: string = '';
  public lastName: string = '';
  public userName: string = '';
  public email: string = '';
  public logInDateDisplay: Date = new Date();
  public joinDate: Date = new Date();
  public profileImageUrl: string = '';
  public active: boolean = false;
  public notLocked: boolean = false;
  public role: string = '';
  public authorities: [] = [];
  
    constructor (){
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.active = false;
        this.notLocked = false;
        this.role = '';
        this.authorities = [];
    }
}