import { LogService } from 'src/app/services/logService/log.service';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import Swal from 'sweetalert2';
import {
  ProcessTree,
  ProcessTreeOperator,
} from 'src/app/objects/ProcessTree/ProcessTree';
import {
  markNodeAsFrozen,
  markNodeAsNonFrozen,
} from 'src/app/objects/ProcessTree/utility-functions/process-tree-freeze';
import { checkForLoadedTreeIntegrity } from 'src/app/objects/ProcessTree/utility-functions/process-tree-integrity-check';
import {
  renameProcessTreeLeafs,
  getSetOfActivitiesInProcessTree,
} from 'src/app/objects/ProcessTree/utility-functions/process-tree-transform';
import {
  NodeSeletionStrategy,
  delete_subtree,
  NodeInsertionStrategy,
  createNewRandomNode,
  insertNode,
} from 'src/app/objects/ProcessTree/utility-functions/process-tree-edit-tree';
import { computeLeafNodeWidth } from 'src/app/utils/render-utils';

@Injectable({
  providedIn: 'root',
})
export class ProcessTreeService {
  constructor(private logService: LogService) {
    this.logService.activitiesInEventLog$.subscribe((activites) => {
      this.nodeWidthCache = computeLeafNodeWidth(
        Object.keys(activites),
        this.nodeWidthCache
      );
    });

    this.logService.loadedEventLog$.subscribe((log) => {
      if (log && log !== 'preload') {
        this.nodeWidthCache = computeLeafNodeWidth(
          Object.keys(this.logService.activitiesInEventLog),
          this.nodeWidthCache
        );
      }
    });
  }

  private _selectedRootNodeID = new BehaviorSubject<number>(null);

  get selectedRootNodeID$(): Observable<number> {
    return this._selectedRootNodeID.asObservable();
  }

  set selectedRootNodeID(node: number) {
    this._selectedRootNodeID.next(node);
  }

  get selectedRootNodeID(): number {
    return this._selectedRootNodeID.getValue();
  }

  private _nodeWidthCache = new BehaviorSubject<Map<string, number>>(
    new Map<string, number>()
  );

  get nodeWidthCache$(): Observable<Map<string, number>> {
    return this._nodeWidthCache.asObservable();
  }

  get nodeWidthCache() {
    return this._nodeWidthCache.getValue();
  }

  set nodeWidthCache(map: Map<string, number>) {
    this._nodeWidthCache.next(map);
  }

  private _correctTreeSyntax = new BehaviorSubject<boolean>(false);

  get correctTreeSyntax$(): Observable<boolean> {
    return this._correctTreeSyntax.asObservable();
  }

  set correctTreeSyntax(flag: boolean) {
    this._correctTreeSyntax.next(flag);
  }

  get correctTreeSyntax(): boolean {
    return this._correctTreeSyntax.getValue();
  }

  private _currentTreeString = new BehaviorSubject<string>('');

  get currentTreeString$(): Observable<string> {
    return this._currentTreeString.asObservable();
  }

  set currentTreeString(syntaxObj: any) {
    this._currentTreeString.next(syntaxObj);
  }

  get currentTreeString() {
    return this._currentTreeString.getValue();
  }

  private _selectedTree: BehaviorSubject<ProcessTree> =
    new BehaviorSubject<ProcessTree>(undefined);

  get selectedTree$(): Observable<any> {
    return this._selectedTree.asObservable();
  }

  get selectedTree(): any {
    return this._selectedTree.getValue();
  }

  set selectedTree(pt: ProcessTree) {
    this._selectedTree.next(pt);
  }

  private _selectionMode = new BehaviorSubject<NodeSeletionStrategy>(
    NodeSeletionStrategy.TREE
  );

  get selectionMode$(): Observable<any> {
    return this._selectionMode.asObservable();
  }

  get selectionMode(): any {
    return this._selectionMode.getValue();
  }

  set selectionMode(strategy: NodeSeletionStrategy) {
    this._selectionMode.next(strategy);
  }

  private _currentDisplayedProcessTree = new BehaviorSubject<ProcessTree>(null);

  get currentDisplayedProcessTree$(): Observable<ProcessTree> {
    return this._currentDisplayedProcessTree.asObservable();
  }

  get currentDisplayedProcessTree(): ProcessTree {
    return this._currentDisplayedProcessTree.getValue();
  }

  private _activitiesInCurrentTree = new BehaviorSubject<Set<string>>(
    new Set<string>()
  );

  public deleteActivityFromProcessTreeActivities(activityName: string): any {
    if (this.activitiesInCurrentTree) {
      this.activitiesInCurrentTree.delete(activityName);
    }
  }

  public renameActivityInProcessTree(
    activityName: string,
    newActivityName: string
  ): any {
    if (
      this.activitiesInCurrentTree &&
      this.activitiesInCurrentTree.delete(activityName)
    )
      this.activitiesInCurrentTree.add(newActivityName);

    if (this.currentDisplayedProcessTree) {
      this.currentDisplayedProcessTree = renameProcessTreeLeafs(
        this.currentDisplayedProcessTree,
        activityName,
        newActivityName
      );
    }
  }

  get activitiesInCurrentTree$(): Observable<Set<string>> {
    return this._activitiesInCurrentTree.asObservable();
  }

  get activitiesInCurrentTree(): Set<string> {
    return this._activitiesInCurrentTree.getValue();
  }

  set activitiesInCurrentTree(activities) {
    this._activitiesInCurrentTree.next(activities);
  }

  set currentDisplayedProcessTree(tree: any) {
    if (tree && !(tree instanceof ProcessTree)) {
      tree = ProcessTree.fromObj(tree);
    }

    this.activitiesInCurrentTree = getSetOfActivitiesInProcessTree(tree);
    const activites = Object.keys(this.logService.activitiesInEventLog);

    if (checkForLoadedTreeIntegrity(tree, activites).size > 0) {
      const unknownActivities = Array.from(
        checkForLoadedTreeIntegrity(tree, activites)
      );
      this.nodeWidthCache = computeLeafNodeWidth(
        unknownActivities,
        this.nodeWidthCache
      );

      Swal.fire({
        title:
          '<tspan class = "text-warning">Current process tree contains unkown activites</tspan>',
        html:
          '<b>Error Message: </b><br>' +
          '<code> The loaded tree contains activities \
              that do not appear in the currently loaded log.\
              </code> <br> <br> Unknown Activites: ' +
          '<tspan class = "text-danger">' +
          unknownActivities.join(', ') +
          '</tspan>',
        icon: 'warning',
        showCloseButton: false,
        showConfirmButton: false,
        showCancelButton: true,
        cancelButtonText: 'close',
      });
    }

    this._currentDisplayedProcessTree.next(tree);
  }

  public set_currentDisplayedProcessTree_with_Cache(tree: any) {
    if (tree && !(tree instanceof ProcessTree)) {
      tree = ProcessTree.fromObj(tree);
    }
    this._currentDisplayedProcessTree.next(tree);
    this.activitiesInCurrentTree = getSetOfActivitiesInProcessTree(tree);
    this.cacheCurrentTree(tree);
  }

  private previousTreeObjects: ProcessTree[] = [];

  private _treeCacheLength = new BehaviorSubject<number>(0);
  private _treeCacheIndex = new BehaviorSubject<number>(0);

  get treeCacheLength$(): Observable<number> {
    return this._treeCacheLength.asObservable();
  }

  set treeCacheLength(node: number) {
    this._treeCacheLength.next(node);
  }

  get treeCacheLength(): number {
    return this._treeCacheLength.getValue();
  }

  get treeCacheIndex$(): Observable<number> {
    return this._treeCacheIndex.asObservable();
  }

  set treeCacheIndex(node: number) {
    this._treeCacheIndex.next(node);
  }

  get treeCacheIndex(): number {
    return this._treeCacheIndex.getValue();
  }

  cacheCurrentTree(root: ProcessTree): void {
    if (this.treeCacheIndex < this.previousTreeObjects.length - 1) {
      // before change, undo was pressed --> remove newer versions since older version of process tree was changed
      this.previousTreeObjects = this.previousTreeObjects.slice(
        0,
        this.treeCacheIndex + 1
      );
    }

    if (root) {
      this.previousTreeObjects.push(root.copy(true));
    } else {
      this.previousTreeObjects.push(null);
    }
    if (this.treeCacheIndex) {
      this.treeCacheIndex += 1;
    } else {
      this.treeCacheIndex = this.previousTreeObjects.length - 1;
    }

    this.treeCacheLength = this.previousTreeObjects.length;
  }

  undo() {
    if (
      this.treeCacheIndex &&
      this.treeCacheIndex > 0 &&
      this.previousTreeObjects.length > 1
    ) {
      this.treeCacheIndex--;

      let treeToLoad = this.previousTreeObjects[this.treeCacheIndex];

      this.selectedRootNodeID = null;
      this.currentDisplayedProcessTree = treeToLoad;
    }
  }

  redo() {
    if (this.treeCacheIndex < this.previousTreeObjects.length - 1) {
      this.treeCacheIndex++;
      let treeToLoad = this.previousTreeObjects[this.treeCacheIndex];

      this.selectedRootNodeID = null;

      this.currentDisplayedProcessTree = treeToLoad;
    }
  }

  freezeSubtree(node: ProcessTree) {
    if (!node.frozen) {
      markNodeAsFrozen(node);
    } else {
      markNodeAsNonFrozen(node);
    }

    this.currentDisplayedProcessTree = this.currentDisplayedProcessTree;
    this.selectedRootNodeID = null;
  }

  shiftSubtreeToLeft(tree: ProcessTree): void {
    this.cacheCurrentTree(this.currentDisplayedProcessTree);

    if (tree.parent) {
      const siblings = tree.parent.children;
      const idxInParentChildList = siblings.indexOf(tree);
      if (idxInParentChildList > 0) {
        const childToRight = siblings[idxInParentChildList - 1];
        const childToLeft = siblings[idxInParentChildList];
        siblings[idxInParentChildList] = childToRight;
        siblings[idxInParentChildList - 1] = childToLeft;

        this.currentDisplayedProcessTree = this.currentDisplayedProcessTree;
      }
    }
  }

  shiftSubtreeToRight(tree: ProcessTree): void {
    this.cacheCurrentTree(this.currentDisplayedProcessTree);

    if (tree.parent) {
      const siblings = tree.parent.children;
      const idxInParentChildList = siblings.indexOf(tree);
      if (idxInParentChildList < siblings.length - 1) {
        const childToRight = siblings[idxInParentChildList];
        const childToLeft = siblings[idxInParentChildList + 1];
        siblings[idxInParentChildList + 1] = childToRight;
        siblings[idxInParentChildList] = childToLeft;

        this.currentDisplayedProcessTree = this.currentDisplayedProcessTree;
      }
    }
  }

  deleteSelected(tree_to_delete: ProcessTree) {
    this.cacheCurrentTree(this.currentDisplayedProcessTree);
    const newTree = this.currentDisplayedProcessTree;

    if (this.currentDisplayedProcessTree === tree_to_delete) {
      this.set_currentDisplayedProcessTree_with_Cache(null);
    } else {
      this.set_currentDisplayedProcessTree_with_Cache(
        delete_subtree(newTree, tree_to_delete)
      );
    }

    this.selectedRootNodeID = null;
  }

  insertNewNode(
    selectedNode: ProcessTree,
    strat: NodeInsertionStrategy,
    operator: ProcessTreeOperator,
    label: string
  ) {
    let newNode: ProcessTree = createNewRandomNode(label, operator);

    if (this.currentDisplayedProcessTree) {
      this.cacheCurrentTree(this.currentDisplayedProcessTree);

      insertNode(selectedNode, newNode, strat, operator, label);

      this.currentDisplayedProcessTree = this.currentDisplayedProcessTree;
      this.selectedRootNodeID = selectedNode.id;
    } else {
      // empty tree - just add a single node
      this.currentDisplayedProcessTree = newNode;
      this.selectedRootNodeID = newNode.id;
    }
  }
}
