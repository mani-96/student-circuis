import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import * as FileSaver from 'file-saver';
import * as XLSX from 'xlsx';
import * as _ from 'lodash';


const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) { }

  baseUrl = "http://13.126.188.182:5000/"


  private _userInfo = new BehaviorSubject<any>(null);
  private _isLoggingOut = new BehaviorSubject<any>(null)
  userInfo = this._userInfo.asObservable();
  isLoggingOut = this._isLoggingOut.asObservable();

  updateUserInfo(info: any) {
    if (!info) {
      this._userInfo.next(null);
      return
    }
    let { username, password } = info;
    let obj = {
      username,
      password
    }
    this._userInfo.next(obj)
  }
  updateIsLoggingOut(value: any) {
    this._isLoggingOut.next(value)
  }

  uploadFile(data: any): Observable<any> {
    const url = this.baseUrl + 'process-file';
    return this.http.post(url, data)
  }

  getStatus(): Observable<any> {
    const url = this.baseUrl + 'current-status';
    return this.http.get(url)
  }

  getFilesList(): Observable<any> {
    const url = this.baseUrl + 'all-info';
    return this.http.get(url)
  }

  downloadFileContent(fileId: any): Observable<any> {
    const url = this.baseUrl + 'get-file?file_id=' + fileId;
    return this.http.get(url, { responseType: 'text' })
  }

  downloadFileJson(fileId: any): Observable<any> {
    const url = this.baseUrl + 'get-file-data?file_id=' + fileId;
    return this.http.get(url)
  }

  public exportAsExcelFile(json: any[], excelFileName: string): void {

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
    console.log('worksheet', worksheet);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    //const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    this.saveAsExcelFile(excelBuffer, excelFileName);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], {
      type: EXCEL_TYPE
    });
    FileSaver.saveAs(data, fileName + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
  }
}
