import { NestedTreeControl } from '@angular/cdk/tree';
import { Component } from '@angular/core';
import { MatTreeNestedDataSource } from '@angular/material/tree';

class Node {
  constructor(
    public id: number, 
    public name: string,
    public isParent: boolean = false,
    public children?: Node[]
  ) { }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title: string = '';
  id: number = 1;
  tree: Node[] = [];
  treeControl = new NestedTreeControl<Node>(node => node.children);
  dataSource = new MatTreeNestedDataSource<Node>();

  constructor() {
    this.tree = [
      new Node(this.nextId(), '1', true, [
        new Node(this.nextId(), '1.1'),
        new Node(this.nextId(), '1.2'),
        new Node(this.nextId(), '1.3')
      ]),
      new Node(this.nextId(), '2'),
      new Node(this.nextId(), '3', true)
    ];

    this.dataSource.data = this.tree;
  }

  nextId = (): number => this.id++;
  
  hasChild = (_: number, node: Node) => node.isParent;
  
  get = (id: number): Node | undefined => this.find(this.tree, id);
  
  refreshTree(): void {
    this.dataSource.data = [];
    this.dataSource.data = this.tree;
  }

  find(nodes: Node[] | undefined, id: number): Node | undefined {
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

  add(parentId: number, newChild: Node): void {
    const node: Node | undefined = this.get(parentId);

    if (!node)
      return;
    
    if (node.children)
      node.children.push(newChild);
    else
      node.children = [newChild];
    
    this.refreshTree();
  }

  clear(id: number): void {
    const node: Node | undefined = this.get(id);

    if (!node)
      return;

    node.children = undefined;

    this.dataSource.data = [];
    this.dataSource.data = this.tree;
  }

  toggle(node: Node): void {
    if (this.treeControl.isExpanded(node))
      this.add(node.id, new Node(this.nextId(), 'child of ' + node.id));
    else
      this.clear(node.id);
  }

}
