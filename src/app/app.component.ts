import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FileService } from './file.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'student-circuis';
  windowDOM = window;
  constructor(private fileServ: FileService, private router: Router) {
  }

  logout() {
    this.fileServ.updateIsLoggingOut(true);
    setTimeout(() => {
      this.fileServ.updateUserInfo(null);
    })
  }

  navigateToHome() {
    this.router.navigate(['/home'])
  }
}
