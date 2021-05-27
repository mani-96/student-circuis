import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpClient) { }

  baseUrl = "http://18.132.4.176:5000/"

  private _userInfo = new BehaviorSubject<any>(null);
  userInfo = this._userInfo.asObservable();

  updateUserInfo(info: any) {
    let { username, password } = info;
    let obj = {
      username,
      password
    }
    this._userInfo.next(obj)
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
}
