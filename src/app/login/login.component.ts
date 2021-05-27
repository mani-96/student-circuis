import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FileService } from '../file.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  constructor(private fileServ: FileService, private router: Router) { }

  ngOnInit(): void {
  }

  username = new FormControl('', Validators.required);
  password = new FormControl('', Validators.required);

  submit() {
    if (this.username.value == 'admin@studentcircuis.com' && this.password.value == 'Blackbird101') {
      this.fileServ.updateUserInfo({ username: this.username.value, password: this.password.value });
      this.router.navigate(['/home'])
    } else {
      this.password.setValue('')
      this.password.setErrors({ validation: true });
    }
  }

}
