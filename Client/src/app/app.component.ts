import { NestedTreeControl } from '@angular/cdk/tree';
import { Component, ViewChild } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { DirectoriesGQL, DirectoriesQuery, Exact, FilesGQL, FilesQuery, Maybe } from 'src/generated/graphql';
import { QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs';
import { SizePipe } from './pipes/size';
import { DatePipe } from '@angular/common';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Title } from '@angular/platform-browser';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

//#region Entities
class Node {
  public readonly dateFormat: string = 'yyyy.MM.dd HH:mm:ss';
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
    public parentId: number,
    public name: string,
    public path: string,
    public dateOfReceiving: Date,
    public dateOfCreation: Date,
    public dateOfLastAccess: Date,
    public dateOfLastWrite: Date,
    public size: number,
    public sizePipe: SizePipe,
    public datePipe: DatePipe) {
      super(name, path, dateOfReceiving);
  }
  get sizeView(): string {
    return this.sizePipe.transform(this.size, 1000000);
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
  readonly title: string = 'ng12.fm';

  // Material
  treeControl = new NestedTreeControl<DirectoryNode>(node => node.children);
  dataSource = new MatTreeNestedDataSource<DirectoryNode>();

  // Tree
  tree: DirectoryNode[] = [];
  nextId: number = 1;
  toggledId: number = 0;
  selectedId: number = 0;

  // Level context
  directories: DirectoryNode[] = [];
  files: MatTableDataSource<FileNode> = new MatTableDataSource<FileNode>([]);

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
  readonly header: HeaderItem[] = [
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
  @ViewChild(MatSort) sort: MatSort = new MatSort();
  expandedRow?: FileNode;
  
  constructor(
    titleService: Title,
    private directoriesGQL: DirectoriesGQL,
    private filesGQL: FilesGQL,
    private sizeFormat: SizePipe,
    private datePipe: DatePipe,
    private http: HttpClient,
    private snackBar: MatSnackBar) {
      titleService.setTitle(this.title);
    
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
          this.files.data = result.data.files.map(f => new FileNode(
            this.selectedId,
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

  ngAfterViewInit() {
    this.files.sort = this.sort;
  }

  //#region Tree
  genNextId = (): number => this.nextId++;

  isParent = (_: number, node: DirectoryNode) => node.isParent;

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

  //#region actions
  downloadFile(path: string) {
    //window.open(environment.uriRoot + 'api/download?path=' + path, '_blank');
    location.href = environment.uriRoot + 'api/download?path=' + path;
  }

  deleteFile(parentId: number, path: string) {
    if  (!confirm('Are you shure?'))
      return;

    this.http.get(environment.uriRoot + 'api/delete?path=' + path, {responseType: 'text'})
      .subscribe(result => {
        console.log(result);
        if (parentId === 0)
          this.filesRef?.refetch();
        else
          this.filesRef?.refetch({parentPath: this.getTreeNode(parentId)?.path});
      }, (httpErrorResponse: HttpErrorResponse) => {
        console.error(httpErrorResponse);
        this.openSnackBar(httpErrorResponse.error, 'error');
      });
  }

  renameFile(parentId: number, path: string) {
    let newName: string | null = prompt('New Name');
    
    if (!newName || newName.match(/^\s*$/))
      return;
    
    newName = newName.replace(/(^\s*)|(\s*$)/, '');
    
    if (!newName.match(/^[\s\.\_\-0-9A-Za-zА-Яа-я]+$/)) {
      this.openSnackBar('The new name can only contain letters, numbers, internal space, dot, dash, underscore, brackets.', 'error');
      return;
    }
    
    this.http.get(environment.uriRoot + 'api/rename?oldPath=' + path + '&newName=' + newName, {responseType: 'text'})
      .subscribe(result => {
        console.log(result);
        if (parentId === 0)
          this.filesRef?.refetch();
        else
          this.filesRef?.refetch({parentPath: this.getTreeNode(parentId)?.path});
      }, (httpErrorResponse: HttpErrorResponse) => {
        console.error(httpErrorResponse);
        this.openSnackBar(httpErrorResponse.error, 'error');
      });
  }

  openSnackBar(message: string, cssClass: string) {
    const config: MatSnackBarConfig = new MatSnackBarConfig();
    config.verticalPosition = 'top';
    config.panelClass = cssClass;
    this.snackBar.open(message, 'Ok', config);
  }
  //#endregion
}
