import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  partition,
  Subject,
  Subscription,
} from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { BackgroundTaskInfoService } from '../backgroundTaskInfoService/background-task-info.service';
import { ConformanceCheckingResult, treeConformanceResult } from './model';
import Swal from 'sweetalert2';
import { ProcessTree } from 'src/app/objects/ProcessTree/ProcessTree';
import { VariantService } from '../variantService/variant.service';
import { InfixType } from 'src/app/objects/Variants/infix_selection';
import { Variant } from 'src/app/objects/Variants/variant';
import { ColorMap } from 'src/app/objects/ColorMap';
import * as d3 from 'd3';
import { COLORS_RED_GREEN } from 'src/app/objects/Colors';
import { ROUTES } from 'src/app/constants/backend_route_constants';
import { ProcessTreeService } from '../processTreeService/process-tree.service';
import { BackendService } from '../backendService/backend.service';
import { processTreesEqual } from 'src/app/objects/ProcessTree/utility-functions/process-tree-integrity-check';
import { ModelViewModeService } from '../viewModeServices/model-view-mode.service';
import { ViewMode } from 'src/app/objects/ViewMode';

@Injectable({
  providedIn: 'root',
})
export class ConformanceCheckingService {
  constructor(
    private infoService: BackgroundTaskInfoService,
    private variantService: VariantService,
    private processTreeService: ProcessTreeService,
    private backendService: BackendService,
    private modelViewModeService: ModelViewModeService
  ) {
    this.processTreeService.currentDisplayedProcessTree$.subscribe((pt) => {
      if (!processTreesEqual(pt, this.usedProcessTreeForTreeConformance)) {
        this.activeTreeConformance = undefined;
        this.availableTreeConformances.clear();
        this.variantsConformance.clear();
      }
    });
  }

  public readonly conformanceColorMap = new ColorMap(
    d3
      .scaleThreshold<any, any>()
      .domain(
        COLORS_RED_GREEN.map(
          (value, index) => index / (COLORS_RED_GREEN.length - 1)
        )
      )
      .range(['#d3d3d3', ...COLORS_RED_GREEN])
  );

  private socket: WebSocketSubject<any>;
  private runningRequests: number[] = [];
  public varResults: Observable<ConformanceCheckingResult>;
  public patternResults: Observable<ConformanceCheckingResult>;
  public showConformanceCheckingTimeoutDialog: Subject<any> =
    new Subject<any>();

  private usedProcessTreeForTreeConformance: ProcessTree;

  public isConformanceWeighted$: BehaviorSubject<Boolean> =
    new BehaviorSubject<Boolean>(false);

  set isConformanceWeighted(isWeighted: Boolean) {
    if (this.isConformanceWeighted !== isWeighted) {
      this.isConformanceWeighted$.next(isWeighted);
    }
  }

  get isConformanceWeighted() {
    return this.isConformanceWeighted$.value;
  }

  private activeTreeConformance: Variant;
  private availableTreeConformances: Set<Variant> = new Set<Variant>();
  public mergedTreeConformance: ProcessTree;
  public variantsConformance: Map<Variant, ProcessTree> = new Map<
    Variant,
    ProcessTree
  >();
  private latestRequest: Subscription;
  public calculationInProgress = new Set<Variant>();

  public connect(): boolean {
    if (!this.socket || this.socket.closed) {
      this.socket = webSocket(
        ROUTES.WS_HTTP_BASE_URL + ROUTES.VARIANT_CONFORMANCE + 'conformancews'
      );
      const results = this.socket.pipe(
        catchError((error) => {
          this.runningRequests.forEach((r: number) =>
            this.infoService.removeRequest(r)
          );
          this.runningRequests = [];
          this.socket = null;
          if (error instanceof CloseEvent) {
            Swal.fire({
              title: 'Error occurred',
              html:
                '<b>Error message: </b><br>' +
                '<code>' +
                'websocket connection for conformance checking was closed' +
                '</code>',
              icon: 'error',
              showCloseButton: false,
              showConfirmButton: false,
              showCancelButton: true,
              cancelButtonText: 'close',
            });
          }
          throw error;
        }),
        tap((_) => {
          this.infoService.removeRequest(this.runningRequests.pop());
        }),
        map((result) => {
          return new ConformanceCheckingResult(
            result['id'],
            result['type'],
            result['isTimeout'],
            result['cost'],
            result['deviations'],
            result['alignment'],
            result['pt']
          );
        })
      );
      [this.varResults, this.patternResults] = partition(
        results,
        (ccr: ConformanceCheckingResult) => ccr.type === 1
      );

      return true;
    }

    return false;
  }

  public calculateConformance(
    id: string,
    infixType: InfixType,
    pt: ProcessTree,
    variant: any,
    timeout: number,
    alignType: AlignmentType
  ): boolean {
    const resubscribe = this.connect();
    const rid = this.infoService.setRequest('conformance checking', () =>
      this.cancelConformanceCheckingRequests()
    );
    this.runningRequests.push(rid);
    this.socket.next({
      id: id,
      infixType: infixType,
      alignType: alignType,
      pt: pt.copy(false),
      variant: variant,
      timeout: timeout,
    });

    return resubscribe;
  }

  private cancelConformanceCheckingRequests(): void {
    this.socket.next({ isCancellationRequested: true });
    this.runningRequests.forEach((r: number) =>
      this.infoService.removeRequest(r)
    );
    this.runningRequests = [];
    this.variantService.variants.forEach((v) => {
      v.calculationInProgress = false;
    });
    this.socket.unsubscribe();
  }

  public showConformanceTimeoutDialog(variant: Variant, callbackFunc) {
    this.showConformanceCheckingTimeoutDialog.next([variant, callbackFunc]);
  }

  public isTreeConformanceActive(v: Variant) {
    return (
      this.activeTreeConformance === v &&
      this.modelViewModeService.viewMode === ViewMode.CONFORMANCE
    );
  }

  public isMergedTreeConformanceActive() {
    return (
      this.activeTreeConformance === null &&
      this.modelViewModeService.viewMode === ViewMode.CONFORMANCE
    );
  }

  public isTreeConformanceAvailable(v: Variant) {
    return this.availableTreeConformances.has(v);
  }

  public isMergedTreeConformanceAvailable() {
    return this.mergedTreeConformance !== undefined;
  }

  public isTreeConformanceCalcInProgress(v: Variant) {
    return this.calculationInProgress.has(v);
  }

  public anyTreeConformanceAvailable() {
    return this.availableTreeConformances.size > 0;
  }

  public updateTreeConformance(
    variants: Variant[],
    removeVariants?: Variant[]
  ) {
    this.latestRequest?.unsubscribe();

    if (removeVariants !== undefined) {
      removeVariants.forEach((v) => this.deleteTreeConformance(v));
      this.calculationInProgress.clear();
    }

    // Add previously computed variants again to get updated merged values
    // conformance values should be cached in backend
    const variantsCombined: Variant[] = Array.from(
      new Set([
        ...variants,
        ...this.variantsConformance.keys(),
        ...this.calculationInProgress,
      ])
    );

    variantsCombined.forEach((v) => {
      if (!this.availableTreeConformances.has(v))
        this.calculationInProgress.add(v);
    });

    this.usedProcessTreeForTreeConformance =
      this.processTreeService.currentDisplayedProcessTree.copy(false);

    this.latestRequest = this.backendService
      .getTreeConformance(
        this.usedProcessTreeForTreeConformance,
        variantsCombined
      )
      .subscribe((res: treeConformanceResult) => {
        this.mergedTreeConformance = res.merged_conformance_tree;

        variantsCombined.forEach((variant, index) => {
          const pt = res.variants_tree_conformance[index];
          this.availableTreeConformances.add(variant);
          this.variantsConformance.set(variant, pt);

          const confButton = document.getElementById(
            `conformanceButton${variant?.bid}`
          );
        });

        this.calculationInProgress.clear();

        if (variants.length == 1) this.setShownTreeConformance(variants[0]);
        else if (variantsCombined.length > 0) this.showMergedTreeConformance();
        else this.unselectTreeConformance();
      });
  }

  public deleteTreeConformance(v: Variant): void {
    if (this.activeTreeConformance == v) {
      this.unselectTreeConformance();
    }
    this.availableTreeConformances.delete(v);
    this.variantsConformance.delete(v);
  }

  public setShownTreeConformance(v: Variant) {
    this.activeTreeConformance = v;
    this.processTreeService.currentDisplayedProcessTree =
      this.variantsConformance.get(v);
    this.modelViewModeService.viewMode = ViewMode.CONFORMANCE;
  }

  public unselectTreeConformance() {
    this.modelViewModeService.viewMode = ViewMode.STANDARD;
    this.activeTreeConformance = undefined;
  }

  public showMergedTreeConformance() {
    this.activeTreeConformance = null;
    this.processTreeService.currentDisplayedProcessTree =
      this.mergedTreeConformance;
    this.modelViewModeService.viewMode = ViewMode.CONFORMANCE;
  }

  public deleteAllTreeConformances() {
    this.updateTreeConformance([], Array.from(this.availableTreeConformances));
  }

  public toggleMergedTreeConformance() {
    if (this.isMergedTreeConformanceActive()) this.unselectTreeConformance();
    else this.showMergedTreeConformance();
  }
}

export enum AlignmentType {
  VariantAlignment = 1,
  PatternAlignment = 2,
}
