import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
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

  constructor(private fileServ: FileService, private modalService: NgbModal, private toastr: ToastrService, private router: Router) { }

  file: any;
  progress = 0;
  processingUpload = false;
  fileProcessing = false;
  filesList: Array<any> = [];
  interval: any;
  userData: any;

  ngOnInit(): void {
    this.fileServ.userInfo.subscribe(data => {
      if (!data) {
        this.router.navigate(['/login'])
      }
      this.userData = data;
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

  submit() {
    if (this.processingUpload) return;
    this.processingUpload = true;
    this.convertFile()
      .then((res: any) => {
        let date = new Date();
        let postObj = {
          fileData: res.split('base64,')[1],
          filename: this.file.name + '(' + date.toLocaleDateString() + ' ' + date.toLocaleTimeString() + ')',
          username: this.userData.username,
          password: this.userData.password
        };
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

  open(content: any) {
    this.getAllFiles(content);
  }

  getAllFiles(content: any) {
    this.fileServ.getFilesList().subscribe(data => {
      let objects: any = data;
      this.filesList = Object.keys(objects).map(key => {
        return {
          fileName: objects[key].filename,
          fileId: key,
          status: objects[key].status,
        }
      })
      this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg', centered: true })
    }, err => {
      console.log('Server error', err)
      this.toastr.error('Server responded with error. Please try again', 'Error')
    })
  }

  mockData() {
    let objects: any = {
      "b011b77d-fb38-448f-aba5-bd3b68da8729": {
        "filename": "testfile.xlsx", "status": "DONE", "file_path":
          "./files/b011b77d-fb38-448f-aba5-bd3b68da8729.csv"
      }
    };
    this.filesList = Object.keys(objects).map(key => {
      return {
        fileName: objects[key].filename,
        fileId: key,
        status: objects[key].status,
      }
    })

  }

  download(id: any, filename?: any) {
    this.fileServ.downloadFileContent(id).subscribe(data => {
      data = "data:text/csv;charset=utf-8," + data;
      let encodedUri = encodeURI(data);
      var link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", (filename.split('.')[0] + ".csv"));
      document.body.appendChild(link);
      link.click();
    })
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


}
