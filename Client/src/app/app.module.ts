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
import { SizeFormat } from './pipes/size';

@NgModule({
  declarations: [
    AppComponent,
    SizeFormat
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
  providers: [SizeFormat],
  bootstrap: [AppComponent]
})
export class AppModule { }
