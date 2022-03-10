import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Material:
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { GraphQLModule } from './graphql.module';
import { HttpClientModule } from '@angular/common/http';

// Splitter
import { AngularSplitModule } from 'angular-split';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,

    // Material:
    MatTreeModule,
    MatIconModule,
    GraphQLModule,
    HttpClientModule,

    // Splitter
    AngularSplitModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
