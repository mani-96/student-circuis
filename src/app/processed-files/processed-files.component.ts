import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ToastrService } from 'ngx-toastr';
import { FileService } from '../file.service';

@Component({
  selector: 'app-processed-files',
  templateUrl: './processed-files.component.html',
  styleUrls: ['./processed-files.component.scss']
})
export class ProcessedFilesComponent implements OnInit {

  constructor(private title: Title, private fileServ: FileService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.title.setTitle('Student Circus - Processed Files')
    this.getAllFiles();
  }
  filesList: any = [];
  ascending = false;

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
      this.toastr.error('Server responded with error. Please try again', 'Error')
    })
  }

  sort() {
    this.filesList = this.filesList.sort((a: any, b: any) => {
      if (a.fileName.indexOf('(') == -1 || b.fileName.indexOf('(') == -1)
        return -1;
      let date1String = a.fileName.split('(');
      date1String = date1String[date1String.length - 1];
      let date2String = b.fileName.split('(');
      date2String = date2String[date2String.length - 1];
      let date1: any = new Date(date1String.split(')')[0]).getTime();
      let date2: any = new Date(date2String.split(')')[0]).getTime();
      return (date1 - date2)
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

  downloadFileJson(id: any, fileName: any) {
    this.fileServ.downloadFileJson(id).subscribe(data => {
      let csvData = this.convertToCSV(data);
      let blob = new Blob(['\ufeff' + csvData], { type: 'text/csv;charset=utf-8;' });
      let dwldLink = document.createElement("a");
      let url = URL.createObjectURL(blob);
      let isSafariBrowser = navigator.userAgent.indexOf('Safari') != -1 && navigator.userAgent.indexOf('Chrome') == -1;
      if (isSafariBrowser) {
        dwldLink.setAttribute("target", "_blank");
      }
      dwldLink.setAttribute("href", url);
      dwldLink.setAttribute("download", fileName.split('.')[0] + ".csv");
      dwldLink.style.visibility = "hidden";
      document.body.appendChild(dwldLink);
      dwldLink.click();
      document.body.removeChild(dwldLink);
    })
  }

  convertToCSV(fileData: any) {
    let headerList = Object.keys(fileData[0]); let str = '';
    let row = 'S.No,';
    for (let index in headerList) {
      row += headerList[index] + ',';
    }
    row = row.slice(0, -1);
    str += row + '\r\n';
    for (let i = 0; i < fileData.length; i++) {
      let line = (i + 1) + '';
      for (let index in headerList) {
        let head = headerList[index];
        line += ',' + fileData[i][head];
      }
      str += line + '\r\n';
    }
    return str;
  }

}
