import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { DndDirective } from './dnd.directive';
import { NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr'


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    DndDirective
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgbModalModule,
    ToastrModule.forRoot(),
    BrowserAnimationsModule

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
