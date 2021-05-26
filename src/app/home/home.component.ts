import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { FileService } from '../file.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  constructor(private fileServ: FileService, private modalService: NgbModal, private toastr: ToastrService) { }

  file: any;
  progress = 0;
  processingUpload = false;
  fileProcessing = false;
  filesList: Array<any> = [];
  interval: any;

  ngOnInit(): void {
    this.startCheckingStatus();
  }

  fileChanged(event: any, manual?: any) {
    this.file = null;
    this.progress = 0;
    if (manual) {
      this.file = event.target.files[0];
    } else {
      if (this.fileProcessing)
        return
      this.file = event;
    }
    this.showFileUpload();
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
        let postObj = {
          fileData: res.split('base64,')[1],
          filename: this.file.name
        };
        this.fileServ.uploadFile(postObj).subscribe(data => {
          this.startCheckingStatus();
          this.processingUpload = false;
          if (data.error) {
            this.toastr.error(data.message, "Error")
          } else {
            this.toastr.success('File uploaded successfully', 'Success');
            this.startCheckingStatus();
          }
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
    this.getAllFiles();
    this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title', size: 'lg', centered: true })
  }

  getAllFiles() {
    this.fileServ.getFilesList().subscribe(data => {
      let objects: any = data;
      this.filesList = Object.keys(objects).map(key => {
        return {
          fileName: objects[key].filename,
          fileId: key,
          status: objects[key].status,
        }
      })
    }, err => {
      console.log('Server error', err)
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

  download(id: any) {

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
