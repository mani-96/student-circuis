import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators'

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {

  constructor() { }
  private count = 0;

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.indexOf('current-status') == -1) {
      if (this.count == 0) {
        (document.getElementById('spinner-div') as HTMLElement).style.display = 'block'
      }
      this.count++;
      return next.handle(request).pipe(
        finalize(() => {
          this.count--;
          if (this.count == 0) {
            (document.getElementById('spinner-div') as HTMLElement).style.display = 'none'
          }
        })
      );
    } else {
      return next.handle(request)
    }
  }
}
