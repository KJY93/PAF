import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthStatus, User } from '../models';
import { UserAuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  form: FormGroup;
  errorMessage = '';
  userAuthStatus: AuthStatus

	constructor(private fb: FormBuilder, private authSvc: UserAuthService, private router: Router) { }

	ngOnInit(): void { 
    this.form = this.fb.group({
      username: this.fb.control('', [ Validators.required ] ),
      password: this.fb.control('', [ Validators.required ])
    })
  }

  async onSubmit() {
    const user: User = this.form.value;
    try {
      const response = await this.authSvc.authenticateUser(user);
      const authStatus = response.message;
      console.info('auth status', authStatus)
      if (authStatus === 'authenticated') { 
        this.router.navigate(['main']);
      } 
      this.errorMessage = authStatus;
    }
    catch(err) {
      console.error(`Error: `, err);
    };
  };
};


