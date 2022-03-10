import { NestedTreeControl } from '@angular/cdk/tree';
import { Component } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { ChildrenGQL, ChildrenQuery, Exact, Maybe } from 'src/generated/graphql';
import { QueryRef } from 'apollo-angular';
import { Subscription } from 'rxjs';

class Node {
  constructor(
    public id: number, 
    public name: string,
    public path: string,
    public dateOfReceiving: Date, // To work refetch() after clicking the glyph again.
    public isParent: boolean = false,
    public children?: Node[],
  ) { }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = '';

  // Data after event
  tree: Node[] = [];

  // Level context
  nextId: number = 1;
  toggledId: number = 0;
  selectedId: number = 0;
  children: Node[] = [];

  // Material
  treeControl = new NestedTreeControl<Node>(node => node.children);
  dataSource = new MatTreeNestedDataSource<Node>();

  // GQL
  childrenSubscription: Subscription | undefined = undefined;
  childrenRef : QueryRef<ChildrenQuery, Exact<{
    parentPath?: Maybe<string> | undefined;
  }>> | undefined = undefined;

  constructor(private childrenGQL: ChildrenGQL) {
    this.childrenRef = this.childrenGQL
      .watch({ }, {fetchPolicy: 'network-only'});

    this.childrenSubscription = this.childrenRef.valueChanges
      .subscribe(result => {
        this.children = result.data.children.map(c => new Node(this.genNextId(), 
          c.name, 
          c.path, 
          c.dateOfReceiving, 
          c.isParent));

        this.add(this.toggledId, this.children);
        this.refresh();
      });
  }
  
  genNextId = (): number => this.nextId++;

  hasChild = (_: number, node: Node) => node.isParent;

  refresh() {
    this.dataSource.data = [];
    this.dataSource.data = this.tree;
  }

  findBranchByBranch(nodes: Node[] | undefined, id: number): Node | undefined {
    if(!nodes)
      return undefined;
    
    let stack: Node[] = Array.from(nodes);
    let found: Node;

    while (stack) {
      found = stack.pop()!;
      if(found.id === id)
        return found;
      if(found.children)
        found.children.forEach(c => stack.push(c));
    }

    return undefined;
  }

  get = (id: number): Node | undefined => this.findBranchByBranch(this.tree, id);
  
  add(parentId: number, children: Node[]): void {

    if (parentId === 0) {
      this.tree = children;
      return;
    }

    const node: Node | undefined = this.get(parentId);

    if (!node)
      return;
    
    node.children = children;
  }

  clear(parentId: number) {
    const node: Node | undefined = this.get(parentId);

    if (node) {
      node.children = undefined;
      this.refresh();
    }
  }

  toggle(node: Node): void {
    this.toggledId = node.id;
    
    if (this.treeControl.isExpanded(node))
      this.childrenRef?.refetch({parentPath: node.path});
    else
      this.clear(node.id);
  }

  select(node: Node): void {
    this.selectedId = node.id;
  }

}
