import { AppComponent } from './app.component';
import { AngularSplitModule } from 'angular-split';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { GraphQLModule } from './graphql.module';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTreeModule } from '@angular/material/tree';

// Pipes
import { DatePipe } from '@angular/common';
import { SizePipe } from './pipes/size';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    AngularSplitModule,
    BrowserModule,
    BrowserAnimationsModule,
    FormsModule,
    GraphQLModule,
    HttpClientModule,

    // Material
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatSortModule,
    MatTableModule,
    MatTreeModule
  ],
  providers: [
    DatePipe,
    SizePipe
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
