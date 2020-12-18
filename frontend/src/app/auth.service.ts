import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
// import { Observable, of } from 'rxjs';
// import { tap, catchError } from 'rxjs/operators';
import { AuthStatus, User } from './models';

@Injectable()

export class UserAuthService {

    BASE_URL = '/api';
    httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private http: HttpClient) { }

    async authenticateUser(user:User): Promise<AuthStatus> { 
        try {
            console.info('hereareaera')
            let response = await this.http.post<AuthStatus>(`${this.BASE_URL}/users`, user, this.httpOptions).toPromise();
            console.info('res', response);
            return response;
        }
        catch(err) {
            return err.error;
        }
    };
};