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
  /** The `Long` scalar type represents non-fractional signed whole 64-bit numeric values. Long can represent values between -(2^63) and 2^63 - 1. */
  Long: any;
};

export type DirectoryNode = {
  __typename?: 'DirectoryNode';
  dateOfReceiving: Scalars['DateTime'];
  isParent: Scalars['Boolean'];
  name: Scalars['String'];
  path: Scalars['String'];
};

export type FileNode = {
  __typename?: 'FileNode';
  dateOfCreation: Scalars['DateTime'];
  dateOfLastAccess: Scalars['DateTime'];
  dateOfLastWrite: Scalars['DateTime'];
  dateOfReceiving: Scalars['DateTime'];
  name: Scalars['String'];
  path: Scalars['String'];
  size: Scalars['Long'];
};

export type Query = {
  __typename?: 'Query';
  directories: Array<DirectoryNode>;
  files: Array<FileNode>;
};


export type QueryDirectoriesArgs = {
  parentPath?: InputMaybe<Scalars['String']>;
};


export type QueryFilesArgs = {
  parentPath?: InputMaybe<Scalars['String']>;
};

export type DirectoriesQueryVariables = Exact<{
  parentPath?: Maybe<Scalars['String']>;
}>;


export type DirectoriesQuery = { __typename?: 'Query', directories: Array<{ __typename?: 'DirectoryNode', name: string, path: string, isParent: boolean, dateOfReceiving: any }> };

export type FilesQueryVariables = Exact<{
  parentPath?: Maybe<Scalars['String']>;
}>;


export type FilesQuery = { __typename?: 'Query', files: Array<{ __typename?: 'FileNode', name: string, path: string, dateOfReceiving: any, dateOfCreation: any, dateOfLastAccess: any, dateOfLastWrite: any, size: any }> };

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
export const FilesDocument = gql`
    query Files($parentPath: String) {
  files(parentPath: $parentPath) {
    name
    path
    dateOfReceiving
    dateOfCreation
    dateOfLastAccess
    dateOfLastWrite
    size
  }
}
    `;

  @Injectable({
    providedIn: 'root'
  })
  export class FilesGQL extends Apollo.Query<FilesQuery, FilesQueryVariables> {
    document = FilesDocument;
    
    constructor(apollo: Apollo.Apollo) {
      super(apollo);
    }
  }