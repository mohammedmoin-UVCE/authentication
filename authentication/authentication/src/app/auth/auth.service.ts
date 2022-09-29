import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, Subject, tap, throwError } from "rxjs";
import { environment} from '../../environments/environment'
import { User } from "./user.model";

@Injectable({providedIn:'root'})
export class AuthService{
  user=new Subject<User>();
  constructor(private http:HttpClient,private router:Router){}

  signUp(email:string,password:string){
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='
    +environment.firebaseKApiey,
    {
        email:email,
        password:password,
        returnSecureToken:true
    }
    ).pipe(catchError(this.handleError),tap(resData=>{
        this.handleAutthentication(resData.email,resData.localId,resData.idToken,+resData.expiresIn);
    }));

  }

  login(email:string,password:string){
    return this.http
    .post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key='
    +environment.firebaseKApiey,
    {
      email:email,
      password:password,
      returnSecureToken:true
    }
    ).pipe(catchError(this.handleError),tap(resData=>{
      this.handleAutthentication(resData.email,resData.localId,resData.idToken,+resData.expiresIn);
  }));

  }

  autoLogin(){
    const userData:{
      email:string;
      id:string;
      _token:string;
     _tokenExpirationDate:Date;
    }=JSON.parse(localStorage.getItem('userDat'));
    if(!userData){
      return;
    }
    const loader=new User(userData.email,userData.id,userData._token,new Date(userData._tokenExpirationDate));
    if(loader.token){
      this.user.next(loader);
    }
  }

  logout(){
    this.user.next(null);
    this.router.navigate(['/auth']);
  }

  private handleAutthentication(email:string,userId:string,token:string,expiresIn:number){
    const expirationDate=new Date(new Date().getTime()+ +expiresIn*1000);
    const user=new User(email,userId,token,expirationDate);
    this.user.next(user);
    localStorage.setItem('userData',JSON.stringify(user));
  }

  private handleError(errorRes:HttpErrorResponse) {

    let errorMessage='An Unknown error Occurred!'
        if(!errorRes.error||!errorRes.error.error){
          return throwError(errorMessage);
        }
        switch(errorRes.error.error.message){
          case "EMAIL_EXISTS":
            errorMessage='This Email exist Already';
            break;
          case 'EMAIL_NOT_FOUND':
            errorMessage='This Email does not exists';
            break;
            case 'INVALID_PASSWORD':
              errorMessage='The Password is Incorrect';
              break;
        }
        return throwError(errorMessage);
  }
}




export interface AuthResponseData{
  kind:string;
  idToken:string;
  email:string;
  refreshToken:string;
  expiresIn:string;
  localId:string;
  registered?:boolean;
}
function autoLogin() {
  throw new Error("Function not implemented.");
}

