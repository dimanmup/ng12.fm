import { NestedTreeControl } from '@angular/cdk/tree';
import { Component } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { DirectoriesGQL, DirectoriesQuery, Exact, FilesGQL, FilesQuery, Maybe } from 'src/generated/graphql';
import { QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { SizeFormat } from './pipes/size';

class Node {
  constructor(
    public name: string,
    public path: string,
    public dateOfReceiving: Date // To work refetch() after clicking the glyph again.
  ) { }
}

class DirectoryNode extends Node {
  constructor(
    public id: number, 
    public name: string,
    public path: string,
    public dateOfReceiving: Date,
    public isParent: boolean = false,
    public children?: DirectoryNode[]) {
      super(name, path, dateOfReceiving);
  }
}

class FileNode extends Node {
  constructor(
    public name: string,
    public path: string,
    public dateOfReceiving: Date,
    public dateOfCreation: Date,
    public dateOfLastAccess: Date,
    public dateOfLastWrite: Date,
    public size: number,
    public sizeFormat: SizeFormat) {
      super(name, path, dateOfReceiving);
  }
  get sizeView(): any {
    return this.sizeFormat.transform(this.size, 1000000);
  }
}

class HeaderItem {
  constructor(public id: string, public name: string) { }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = '';

  // Data after event
  tree: DirectoryNode[] = [];

  // Level context
  nextId: number = 1;
  toggledId: number = 0;
  selectedId: number = 0;
  directories: DirectoryNode[] = [];
  files: FileNode[] = [];

  // Material
  treeControl = new NestedTreeControl<DirectoryNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<DirectoryNode>();

  // GQL
  directoriesSubscription: Subscription;
  directoriesRef: QueryRef<DirectoriesQuery, Exact<{
    parentPath?: Maybe<string> | undefined;
  }>>;
  filesSubscription: Subscription;
  filesRef: QueryRef<FilesQuery, Exact<{
    parentPath?: Maybe<string> | undefined;
  }>>;

  // Table
  expandedRow?: FileNode;
  header: HeaderItem[] = [
    new HeaderItem('name', 'Name'),
    new HeaderItem('sizeView', 'Size (MB)')
  ];
  get fileNodeKeys(): string[] {
    return this.header.map(h => h.id);
  }

  constructor(
      private directoriesGQL: DirectoriesGQL,
      private filesGQL: FilesGQL,
      private sizeFormat: SizeFormat
    ) {
    this.directoriesRef = this.directoriesGQL
      .watch({ }, {fetchPolicy: 'network-only'});

    this.directoriesSubscription = this.directoriesRef.valueChanges
      .subscribe(result => {
        this.directories = result.data.directories.map(c => new DirectoryNode(this.genNextId(), 
          c.name, 
          c.path, 
          c.dateOfReceiving, 
          c.isParent));

        this.add(this.toggledId, this.directories);
        this.refresh();
      });

    this.filesRef = this.filesGQL
      .watch({ }, {fetchPolicy: 'network-only'});

    this.filesSubscription = this.filesRef.valueChanges
      .subscribe(result => {
        this.files = result.data.files.map(f => new FileNode(
          f.name,
          f.path,
          f.dateOfReceiving,
          f.dateOfCreation,
          f.dateOfLastAccess,
          f.dateOfLastWrite,
          f.size,
          this.sizeFormat
        ));
      });
  }
  
  genNextId = (): number => this.nextId++;

  isParent = (_: number, node: DirectoryNode) => node.isParent;

  refresh() {
    this.dataSource.data = [];
    this.dataSource.data = this.tree;
  }

  findBranchByBranch(nodes: DirectoryNode[] | undefined, id: number): DirectoryNode | undefined {
    if(!nodes)
      return undefined;
    
    let stack: DirectoryNode[] = Array.from(nodes);
    let found: DirectoryNode;

    while (stack) {
      found = stack.pop()!;
      if(found.id === id)
        return found;
      if(found.children)
        found.children.forEach(c => stack.push(c));
    }

    return undefined;
  }

  get = (id: number): DirectoryNode | undefined => this.findBranchByBranch(this.tree, id);
  
  add(parentId: number, children: DirectoryNode[]): void {

    if (parentId === 0) {
      this.tree = children;
      return;
    }

    const node: DirectoryNode | undefined = this.get(parentId);

    if (!node)
      return;
    
    node.children = children;
  }

  clear(parentId: number) {
    const node: DirectoryNode | undefined = this.get(parentId);

    if (node) {
      node.children = undefined;
      this.refresh();
    }
  }

  toggle(node: DirectoryNode): void {
    this.toggledId = node.id;
    
    if (this.treeControl.isExpanded(node))
      this.directoriesRef?.refetch({parentPath: node.path});
    else
      this.clear(node.id);
  }

  select(node: DirectoryNode): void {
    this.selectedId = node.id;
    this.filesRef?.refetch({parentPath: node.path});
  }

}
