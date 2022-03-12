import { NestedTreeControl } from '@angular/cdk/tree';
import { Component } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { DirectoriesGQL, DirectoriesQuery, Exact, FilesGQL, FilesQuery, Maybe } from 'src/generated/graphql';
import { QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { SizePipe } from './pipes/size';
import { DatePipe } from '@angular/common';

//#region Entities
class Node {
  public readonly dateFormat: string = 'yyyy.MM.dd HH:mm:ss';
  constructor(
    public name: string,
    public path: string,
    public dateOfReceiving: Date, // To work refetch() after clicking the glyph again.
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
    public sizeFormat: SizePipe,
    public datePipe: DatePipe) {
      super(name, path, dateOfReceiving);
  }
  get sizeView(): string {
    return this.sizeFormat.transform(this.size, 1000000);
  }
  get dateOfReceivingView(): string | null {
    return this.datePipe.transform(this.dateOfReceiving, this.dateFormat);
  }
  get dateOfCreationView(): string | null {
    return this.datePipe.transform(this.dateOfCreation, this.dateFormat);
  }
  get dateOfLastAccessView(): string | null {
    return this.datePipe.transform(this.dateOfLastAccess, this.dateFormat);
  }
  get dateOfLastWriteView(): string | null {
    return this.datePipe.transform(this.dateOfLastWrite, this.dateFormat);
  }
}

class HeaderItem {
  constructor(
    public id: string, 
    public name: string,
    public visible: boolean = false) { }
}
//#endregion

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = '';

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
    new HeaderItem('name', 'Name', true),
    new HeaderItem('sizeView', 'Size (MB)', true),
    new HeaderItem('dateOfReceivingView', 'Date of Receiving', false),
    new HeaderItem('dateOfCreationView', 'Date of Creation', true),
    new HeaderItem('dateOfLastAccessView', 'Date of Last Access', false),
    new HeaderItem('dateOfLastWriteView', 'Date of Last Write', false)
  ];
  get headerVisible(): HeaderItem[] {
    return this.header.filter(h => h.visible);
  }
  get headerVisibleIds(): string[] {
    return this.headerVisible.map(h => h.id);
  }

  constructor(
      private directoriesGQL: DirectoriesGQL,
      private filesGQL: FilesGQL,
      private sizeFormat: SizePipe,
      private datePipe: DatePipe
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

        this.addTreeNodeChildren(this.toggledId, this.directories);
        this.refreshTree();
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
          this.sizeFormat,
          this.datePipe
        ));
      });
  }
  
  genNextId = (): number => this.nextId++;

  isParent = (_: number, node: DirectoryNode) => node.isParent;

  //#region Tree
  refreshTree() {
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

  getTreeNode = (id: number): DirectoryNode | undefined => this.findBranchByBranch(this.tree, id);
  
  addTreeNodeChildren(parentId: number, children: DirectoryNode[]): void {

    if (parentId === 0) {
      this.tree = children;
      return;
    }

    const node: DirectoryNode | undefined = this.getTreeNode(parentId);

    if (!node)
      return;
    
    node.children = children;
  }

  clearTreeNode(parentId: number) {
    const node: DirectoryNode | undefined = this.getTreeNode(parentId);

    if (node) {
      node.children = undefined;
      this.refreshTree();
    }
  }

  toggleTreeNode(node: DirectoryNode): void {
    this.toggledId = node.id;
    
    if (this.treeControl.isExpanded(node))
      this.directoriesRef?.refetch({parentPath: node.path});
    else
      this.clearTreeNode(node.id);
  }

  selectTreeNode(node: DirectoryNode): void {
    this.selectedId = node.id;
    this.filesRef?.refetch({parentPath: node.path});
  }
  //#endregion

  //#region Table
  includeColumn(include: boolean, columnName: string) {
    const h: HeaderItem | undefined = this.header.find(h => h.id === columnName);
    if (h)
      h.visible = include;
  }
  //#endregion
}
