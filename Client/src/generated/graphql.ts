import { gql } from 'apollo-angular';
import { Injectable } from '@angular/core';
import * as Apollo from 'apollo-angular';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `DateTime` scalar represents an ISO-8601 compliant date time type. */
  DateTime: any;
};

export type DirectoryNode = {
  __typename?: 'DirectoryNode';
  dateOfReceiving: Scalars['DateTime'];
  isParent: Scalars['Boolean'];
  name: Scalars['String'];
  path: Scalars['String'];
};

export type Query = {
  __typename?: 'Query';
  directories: Array<DirectoryNode>;
};


export type QueryDirectoriesArgs = {
  parentPath?: InputMaybe<Scalars['String']>;
};

export type DirectoriesQueryVariables = Exact<{
  parentPath?: Maybe<Scalars['String']>;
}>;


export type DirectoriesQuery = { __typename?: 'Query', directories: Array<{ __typename?: 'DirectoryNode', name: string, path: string, isParent: boolean, dateOfReceiving: any }> };

export const DirectoriesDocument = gql`
    query Directories($parentPath: String) {
  directories(parentPath: $parentPath) {
    name
    path
    isParent
    dateOfReceiving
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class DirectoriesGQL extends Apollo.Query<DirectoriesQuery, DirectoriesQueryVariables> {
    document = DirectoriesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }