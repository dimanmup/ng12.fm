import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { GraphQLModule } from './graphql.module';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

// Material:
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTreeModule } from '@angular/material/tree';

// Splitter
import { AngularSplitModule } from 'angular-split';

// Pipes
import { SizePipe } from './pipes/size';
import { DatePipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    GraphQLModule,
    HttpClientModule,

    // Material:
    MatCheckboxModule,
    MatIconModule,
    MatTableModule,
    MatTreeModule,

    // Splitter
    AngularSplitModule
  ],
  providers: [
    SizePipe,
    DatePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
