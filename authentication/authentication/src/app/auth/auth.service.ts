import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { catchError, Subject, tap, throwError } from "rxjs";
import { environment} from '../../environments/environment'
import { User } from "./user.model";

@Injectable({providedIn:'root'})
export class AuthService{
  user=new Subject<User>;
  constructor(private http:HttpClient){}
  signUp(email:string,password:string){
    return this.http.post<AuthResponseData>('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key='
    +environment.firebaseKApiey,
    {
        email:email,
        password:password,
        returnSecureToken:true
    }
    ).pipe(catchError(this.handleError),tap(resData=>{
      const expirationDate=new Date(new Date().getTime()+ +resData.expiresIn*1000)

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
    ).pipe(catchError(this.handleError));
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
