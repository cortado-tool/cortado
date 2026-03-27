import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { catchError, map, mergeMap, take, tap, toArray } from 'rxjs/operators';
import { Configuration } from 'src/app/components/settings/model';
import { ProcessTree } from 'src/app/objects/ProcessTree/ProcessTree';
import { TimeUnit } from 'src/app/objects/TimeUnit';
import { mapVariants, mapVariantsList } from 'src/app/utils/util';
import { LogService } from '../logService/log.service';
import { ProcessTreeService } from './../processTreeService/process-tree.service';
import { VariantElement } from 'src/app/objects/Variants/variant_element';
import { ROUTES } from 'src/app/constants/backend_route_constants';
import { MiningConfig } from 'src/app/objects/Variants/variant-miner-types';
import { ElectronService } from '../electronService/electron.service';
import { InfixType } from 'src/app/objects/Variants/infix_selection';
import { treeConformanceResult } from '../conformanceChecking/model';
import { Variant } from 'src/app/objects/Variants/variant';
import { ClusteringConfig } from 'src/app/objects/ClusteringConfig';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  public retryEventLogSelection = new Subject();
  public cancelOtherBgTasks = new Subject();

  constructor(
    private httpClient: HttpClient,
    private logService: LogService,
    private processTreeService: ProcessTreeService,
    private sharedDataService: SharedDataService,
    private electronService: ElectronService
  ) {}

  exportEventLog(
    bids: number[],
    sequentializeVariants = false,
    exportAsIntervalLog = true,
    includeOriginalLogInfo = true
  ) {
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.EXPORT + 'exportLogVariants',
      {
        bids: bids,
        sequentializeVariants: sequentializeVariants,
        exportAsIntervalLog: exportAsIntervalLog,
        includeOriginalLogInfo: includeOriginalLogInfo,
      },
      { responseType: 'blob' }
    );
  }

  exportEventLogFromLog(bids: number[]) {
    throw new Error('Deprecated');
  }

  loadEventLogFromFilePath(filePath: string): Observable<any> {
    return this.httpClient
      .post(ROUTES.HTTP_BASE_URL + ROUTES.IMPORT + 'loadEventLogFromFilePath', {
        file_path: filePath,
      })
      .pipe(
        catchError((err) => {
          this.retryEventLogSelection.next(filePath);
          throw (
            'Error during event log import. Prompting user for different path. Details: ' +
            err
          );
        }),
        mapVariants(),
        tap((res) => {
          this.logService.processEventLog(res, filePath);
        })
      );
  }

  uploadEventLog(file: File) {
    let formData = new FormData();
    formData.append('file', file);

    return this.httpClient
      .post(
        ROUTES.HTTP_BASE_URL + ROUTES.IMPORT + 'loadEventLogFromFile',
        formData
      )
      .pipe(
        mapVariants(),
        tap((res) => {
          this.logService.processEventLog(res, file['path']);
        })
      );
  }

  loadProcessTreeFromFilePath(filePath: string): void {
    this.httpClient
      .post(
        ROUTES.HTTP_BASE_URL +
          ROUTES.IMPORT +
          'loadProcessTreeFromPtmlFilePath',
        {
          file_path: filePath,
        }
      )
      .subscribe((tree) => {
        this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
          tree
        );
      });
  }

  loadProcessTreeFromFile(file: File) {
    let formData = new FormData();
    formData.append('file', file);

    this.httpClient
      .post(
        ROUTES.HTTP_BASE_URL + ROUTES.IMPORT + 'loadProcessTreeFromPtmlFile',
        formData
      )
      .subscribe((tree) => {
        this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
          tree
        );
      });
  }

  discoverProcessModelFromVariants(variants: any[]): void {
    this.httpClient
      .post(
        ROUTES.HTTP_BASE_URL +
          ROUTES.DISCOVER +
          'discoverProcessModelFromVariants',
        {
          variants: variants,
        }
      )
      .subscribe((tree) => {
        this.processTreeService.currentDisplayedProcessTree = tree;
      });
  }

  discoverProcessModelFromConcurrencyVariants(
    variants: Variant[]
  ): Observable<any> {
    const variantsSerialized = variants.map((v) => [
      v.variant.serialize(1),
      v.infixType,
    ]);
    return this.httpClient
      .post(
        ROUTES.HTTP_BASE_URL +
          ROUTES.DISCOVER +
          'discoverProcessModelFromConcurrencyVariants',
        {
          variants: variantsSerialized,
        }
      )
      .pipe(
        tap((tree) => {
          this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
            tree
          );
        })
      );
  }

  computeTreeString(tree: ProcessTree): void {
    this.httpClient
      .post(
        ROUTES.HTTP_BASE_URL + ROUTES.PT_STRING + 'computeTreeStringFromTree',
        {
          pt: tree.copy(false),
        }
      )
      .subscribe((tree) => {
        this.processTreeService.currentTreeString = tree;
      });
  }

  renderStringToPT(treeString: string) {
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.PT_STRING + 'parseStringToPT',
      {
        pt_string: treeString,
      }
    );
  }

  downloadCurrentTreeAsBPMN(): void {
    this.processTreeService.currentDisplayedProcessTree$
      .pipe(take(1))
      .subscribe((tree) => {
        this.httpClient
          .post(
            ROUTES.HTTP_BASE_URL + ROUTES.EXPORT + 'convertPtToBPMN',
            { pt: tree.copy(false) },
            { responseType: 'blob' }
          )
          .subscribe((blob) => {
            this.electronService.showSaveDialog(
              'bpmn_model',
              'bpmn',
              blob,
              'Save BPMN model',
              'Download current tree as BPMN'
            );
            // FileSaver.saveAs(blob, 'bpmn_model.bpmn');
          });
      });
  }

  downloadCurrentTreeAsPTML(): void {
    this.processTreeService.currentDisplayedProcessTree$
      .pipe(take(1))
      .subscribe((tree) => {
        this.httpClient
          .post(
            ROUTES.HTTP_BASE_URL + ROUTES.EXPORT + 'convertPtToPTML',
            { pt: tree.copy(false) },
            { responseType: 'blob' }
          )
          .subscribe((blob) => {
            this.electronService.showSaveDialog(
              'process_tree',
              'ptml',
              blob,
              'Save as ptml',
              'Download current tree as PTML'
            );
            // FileSaver.saveAs(blob, 'process_tree.ptml');
          });
      });
  }

  downloadCurrentTreeAsPNML(): void {
    this.processTreeService.currentDisplayedProcessTree$
      .pipe(take(1))
      .subscribe((tree) => {
        this.httpClient
          .post(
            ROUTES.HTTP_BASE_URL + ROUTES.EXPORT + 'convertPtToPNML',
            { pt: tree.copy(false) },
            { responseType: 'blob' }
          )
          .subscribe((blob) => {
            this.electronService.showSaveDialog(
              'petri_net',
              'pnml',
              blob,
              'Save as pnml',
              'Download current tree as PNML'
            );
            // FileSaver.saveAs(blob, 'petri_net.pnml');
          });
      });
  }

  applyTreeReductionRules(): void {
    this.processTreeService.currentDisplayedProcessTree$
      .pipe(take(1))
      .subscribe((tree) => {
        this.httpClient
          .post(
            ROUTES.HTTP_BASE_URL +
              ROUTES.MODIFY_TREE +
              'applyReductionRulesToTree',
            {
              pt: tree.copy(false),
            }
          )
          .subscribe((tree) =>
            this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
              tree
            )
          );
      });
  }

  // TODO this function is currently unused
  addVariantsToModel(
    variantsToAdd: any[],
    explicitlyAddedVariants: any[]
  ): void {
    const body = {
      pt: this.processTreeService.currentDisplayedProcessTree.copy(false),
      variants_to_add: variantsToAdd,
      fitting_variants: explicitlyAddedVariants,
    };
    this.httpClient
      .post(
        ROUTES.HTTP_BASE_URL + ROUTES.DISCOVER + 'addVariantsToProcessModel',
        body
      )
      .subscribe((res) => {
        this.processTreeService.set_currentDisplayedProcessTree_with_Cache(res);
      });
  }

  getTreePerformance(variants: number[], remove?: number[]): Observable<any> {
    const body = {
      pt: this.processTreeService.currentDisplayedProcessTree.copy(false),
      variants: variants,
      delete: remove,
    };

    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL +
        ROUTES.TREE_PERFORMANCE +
        'calculateVariantsPerformance',
      body
    );
  }

  addConcurrencyVariantsToProcessModel(
    variantsToAdd: Variant[],
    variantsInModelLanguage: Variant[]
  ): Observable<any> {
    const body = {
      pt: this.processTreeService.currentDisplayedProcessTree.copy(false),
      variants_to_add: variantsToAdd.map((v) => [
        v.variant.serialize(1),
        v.infixType,
      ]),
      fitting_variants: variantsInModelLanguage.map((v) => [
        v.variant.serialize(1),
        v.infixType,
      ]),
    };
    return this.httpClient
      .post(
        ROUTES.HTTP_BASE_URL +
          ROUTES.DISCOVER +
          'addConcurrencyVariantsToProcessModel',
        body
      )
      .pipe(
        tap((res) => {
          this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
            res
          );
        })
      );
  }

  addConcurrencyVariantsToProcessModelForUnknownConformance(
    selectedVariants: Variant[]
  ): Observable<any> {
    const body = {
      pt: this.processTreeService.currentDisplayedProcessTree.copy(false),
      selected_variants: selectedVariants.map((v) => [
        v.variant.serialize(1),
        v.infixType,
      ]),
    };
    return this.httpClient
      .post(
        ROUTES.HTTP_BASE_URL +
          ROUTES.DISCOVER +
          'addConcurrencyVariantsToProcessModelUnknownConformance',
        body
      )
      .pipe(
        tap((res) => {
          this.processTreeService.set_currentDisplayedProcessTree_with_Cache(
            res
          );
        })
      );
  }

  frequentSubtreeMining(config: MiningConfig): void {
    this.httpClient
      .post<Array<any>>(
        ROUTES.HTTP_BASE_URL + ROUTES.VARIANTMINING + 'frequentSubtreeMining',
        config.serialize()
      )
      .subscribe((res) => {
        this.sharedDataService.frequentMiningResults = res;
      });
  }

  saveConfiguration(configuration: Configuration): Observable<any> {
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.CONFIG + 'saveConfiguration',
      configuration
    );
  }

  getConfiguration(): Observable<any> {
    return this.httpClient.get<Configuration>(
      ROUTES.HTTP_BASE_URL + ROUTES.CONFIG + 'getConfiguration'
    );
  }

  variantQuery(query: string): Observable<any> {
    const queryBody = { queryString: query };
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.QUERY + 'variant-query',
      queryBody
    );
  }

  visualQuery(query: any, type: string = 'BFS'): Observable<any> {
    const queryBody = { pattern: query, type: type };
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.QUERY + 'queryPattern',
      queryBody
    );
  }

  // Querying for logical patterns (with AND, OR)
  visualQueryLogical(query: any, type: string = 'BFS'): Observable<any> {
    const queryBody = { pattern: query, type: type };
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.QUERY + 'queryLogicalPattern',
      queryBody
    );
  }

  getInfo(): Observable<any> {
    return this.httpClient.get(ROUTES.HTTP_BASE_URL + 'info');
  }

  public getEventLog(): Observable<any> {
    return this.httpClient.get(ROUTES.HTTP_BASE_URL + 'log');
  }

  /**
   * Fetches the properties of the log that is currently cached in the backend.
   * If no time granularity is provided the granularity of the log is computed in
   * the backend.
   * @param timeGranularity
   * @param logName
   */
  public getLogPropsAndUpdateState(
    timeGranularity?: TimeUnit,
    logName?: string
  ): Observable<any> {
    return this.getProperties(timeGranularity).pipe(
      tap((properties) => {
        this.logService.processEventLog(properties, logName);
      })
    );
  }

  public getProperties(timeGranularity?: TimeUnit): Observable<any> {
    return this.httpClient
      .post(ROUTES.HTTP_BASE_URL + ROUTES.LOG + 'properties', {
        timeGranularity: timeGranularity,
      })
      .pipe(mapVariants());
  }

  public getLogGranularity(): Observable<TimeUnit> {
    return this.httpClient.get<TimeUnit>(
      ROUTES.HTTP_BASE_URL + ROUTES.LOG + 'granularity'
    );
  }

  public resetLogCache(): Observable<any> {
    return this.httpClient.get(
      ROUTES.HTTP_BASE_URL + ROUTES.LOG + 'resetLogCache'
    );
  }

  getLogBasedPerformance(start: number, end: number): Observable<any> {
    const body = { start: start, end: end };
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL +
        ROUTES.VARIANT_PERFORMANCE +
        'logBasedVariantPerformance',
      body
    );
  }

  getSubvariantsForVariant(bid: number): Observable<any> {
    let body = {
      bid: bid,
    };
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.SUBVARIANT_PERFORMANCE + 'subvariants',
      body
    );
  }

  public applyVariantSequentializer(sourcePattern, targetPattern) {
    this.httpClient
      .post(ROUTES.HTTP_BASE_URL + ROUTES.SEQUENTIALIZER + 'apply', {
        sourcePattern: sourcePattern,
        targetPattern: targetPattern,
      })
      .pipe(mapVariants())
      .subscribe((res) => {
        this.logService.processEventLog(res);
      });
  }

  public getTreeConformance(
    pt: ProcessTree,
    variants: Variant[]
  ): Observable<treeConformanceResult> {
    const body = {
      pt: pt,
      variants: variants.map((variant) => {
        console.log(variant);
        return {
          variant: variant.variant.serialize(),
          infixType: variant.infixType,
          count:
            variant.infixType == InfixType.NOT_AN_INFIX
              ? variant.count
              : variant.fragmentStatistics.traceOccurrences,
        };
      }),
    };

    return this.httpClient
      .post(
        ROUTES.HTTP_BASE_URL +
          ROUTES.TREE_CONFORMANCE +
          'calculateVariantsConformance',
        body
      )
      .pipe(
        map((res: treeConformanceResult) => {
          const treeConfRes = {
            merged_conformance_tree: ProcessTree.fromObj(
              res.merged_conformance_tree
            ),
            variants_tree_conformance: res.variants_tree_conformance.map((pt) =>
              ProcessTree.fromObj(pt)
            ),
          };
          return treeConfRes;
        })
      );
  }
  addUserDefinedVariant(variant: Variant) {
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.MODIFY_LOG + 'addUserDefinedVariant',
      {
        variant: variant.variant.serialize(),
        bid: variant.bid,
      }
    );
  }
  addUserDefinedInfix(variant: Variant) {
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.MODIFY_LOG + 'addUserDefinedInfix',
      {
        variant: variant.variant.serialize(),
        bid: variant.bid,
        infixType: variant.infixType,
      }
    );
  }

  changeActivityName(mergeList, renameList, activityName, newActivityName) {
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.MODIFY_LOG + 'changeActivityName',
      {
        mergeList: mergeList,
        renameList: renameList,
        activityName: activityName,
        newActivityName: newActivityName,
      }
    );
  }

  deleteActivity(
    activityName,
    fallthrough,
    delete_member_list,
    merge_list,
    delete_variant_list
  ) {
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.MODIFY_LOG + 'deleteActivity',
      {
        activityName: activityName,
        fallthrough: fallthrough,
        delete_member_list: delete_member_list,
        merge_list: merge_list,
        delete_variant_list: delete_variant_list,
      }
    );
  }

  deleteVariants(bids: number[]) {
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.MODIFY_LOG + 'deleteVariants',
      {
        bids: bids,
      }
    );
  }

  revertLastLogModification() {
    return this.httpClient
      .post(ROUTES.HTTP_BASE_URL + ROUTES.MODIFY_LOG + 'revertLastChange', {})
      .pipe(mapVariants());
  }

  countFragmentOccurrences(variant: Variant) {
    return this.httpClient.post<any>(
      ROUTES.HTTP_BASE_URL + ROUTES.VARIANT + 'countFragmentOccurrences',
      {
        infixType: InfixType[variant.infixType],
        fragment: variant.variant.serialize(),
      }
    );
  }

  getCollapsedVariants() {
    return this.httpClient.get(
      ROUTES.HTTP_BASE_URL + ROUTES.IMPORT + 'collapsedVariants'
    );
  }

  computeClusters(clusteringConfig: ClusteringConfig): Observable<any[][]> {
    return this.httpClient
      .post<any>(
        ROUTES.HTTP_BASE_URL + ROUTES.VARIANT + 'cluster',
        clusteringConfig
      )
      .pipe(mergeMap((clusters) => clusters)) // flat map
      .pipe(mapVariantsList()) // deserialize
      .pipe(toArray()); // collect to array
  }

  public discoverLpms(patterns) {
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.LPMMINER + 'lpmMining',
      {
        patterns: patterns,
      }
    );
  }

  public getLpmMetrics(lpm: ProcessTree) {
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.LPMMINER + 'lpmStatistics',
      {
        lpm: lpm.copy(false),
      }
    );
  }

  public sortInVariantModeler(variant: VariantElement) {
    const variants = variant.serialize();
    return this.httpClient.post(
      ROUTES.BASE_URL + ROUTES.VARIANT + 'sortvariant',
      {
        variants,
      }
    );
  }

  public calculateCaseStatistics(index) {
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.VARIANT + 'caseStatistics',
      {
        index: index,
      }
    );
  }

  public getCaseActivities(index, caseId) {
    return this.httpClient.post(
      ROUTES.HTTP_BASE_URL + ROUTES.VARIANT + 'caseActivities',
      {
        index: index,
        caseId: caseId,
      }
    );
  }

  get _cancelOtherBgTasks$(): Observable<any> {
    return this.cancelOtherBgTasks.asObservable();
  }
}
