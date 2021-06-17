import { Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { FileService } from '../file.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private title: Title, private fileServ: FileService, private modalService: NgbModal, private toastr: ToastrService, private router: Router) { }

  file: any;
  progress = 0;
  processingUpload = false;
  fileProcessing = false;
  interval: any;
  userData: any;
  optionSelected: any = null;
  logout = false;

  username = new FormControl('', Validators.required);
  password = new FormControl('', Validators.required)


  ngOnInit(): void {
    this.title.setTitle('Student Circus - Home')
    this.fileServ.isLoggingOut.subscribe(data =>
      this.logout = data)
    this.fileServ.userInfo.subscribe(data => {
      setTimeout(() => {
        if (!data) {
          if (sessionStorage.getItem('userInfo')) {
            let data = JSON.parse(sessionStorage.getItem('userInfo') as string);
            sessionStorage.clear()
            this.fileServ.updateUserInfo(data);
          } else
            this.router.navigate(['/login'])
        }
        this.userData = data;
      })
    })
    this.startCheckingStatus();
  }

  fileChanged(event: any, manual?: any) {
    this.file = null;
    this.progress = 0;
    if (manual) {
      if (event.target.files[0].type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || event.target.files[0].type == 'application/vnd.ms-excel') {
        this.file = event.target.files[0];
        this.showFileUpload();
      } else {
        alert('Please upload a valid file. Accepted files types are .xlsx or .csv')
      }
    } else {
      if (this.fileProcessing)
        return
      if (event.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || event.type == 'application/vnd.ms-excel') {
        this.file = event;
        this.showFileUpload();
      } else {
        alert('Please upload a valid file. Accepted files types are .xlsx or .csv')
      }
    }
  }

  showFileUpload() {
    setTimeout(() => {
      const progressInterval = setInterval(() => {
        if (this.progress !== 100) {
          this.progress += 5;
        } else {
          clearInterval(progressInterval);
        }
      }, 50);
    }, 100);
  }

  convertFile(): Promise<any> {
    return new Promise((resolve, reject) => {
      let fileReader = new FileReader();
      fileReader.readAsDataURL(this.file);
      fileReader.onloadend = (data: any) => {
        if (data.target.readyState == FileReader.DONE) {
          resolve(data.target.result);
        }
      };
    })
  }

  submit(option: any) {
    this.optionSelected = '';
    this.modalService.open(option, { ariaLabelledBy: 'modal-basic-title', centered: true })
  }

  upload() {
    if (this.processingUpload) return;
    this.processingUpload = true;
    this.convertFile()
      .then((res: any) => {
        let date = new Date();
        let postObj = {
          fileData: res.split('base64,')[1],
          filename: this.file.name + '(' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString() + ')',
          username: this.username.value,
          password: this.password.value
        };
        if (!this.optionSelected) {
          delete postObj['username'];
          delete postObj['password']
        }
        this.fileServ.uploadFile(postObj).subscribe(data => {
          this.startCheckingStatus();
          this.processingUpload = false;
          if (data.error) {
            this.toastr.error(data.message, "Error");
          } else {
            this.toastr.success('File uploaded successfully', 'Success');
            this.file = '';
          }
          this.startCheckingStatus();
        },
          err => {
            console.log('Error', err);
            this.processingUpload = false;
            this.toastr.error('Service responded with error. Please try again', "Error")
          })
      })
      .catch((err: any) => {
        console.log(err);
        this.processingUpload = false;
      });
  }

  startCheckingStatus() {
    this.getStatus();
    this.interval = setInterval(() => {
      this.getStatus()
    }, 5000)
  }

  getStatus() {
    this.fileServ.getStatus().subscribe(data => {
      if (data.status == 'busy') {
        this.fileProcessing = true;
      } else {
        this.fileProcessing = false;
        clearInterval(this.interval)
      }
    })
  }

  @HostListener('window: beforeunload')
  beforeUnload() {
    if (!this.logout && this.userData) {
      sessionStorage.setItem('userInfo', JSON.stringify(this.userData))
    } else {
      sessionStorage.clear();
    }
  }


}
