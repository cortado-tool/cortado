import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, take, tap } from 'rxjs/operators';
import { Configuration } from 'src/app/components/settings/model';
import { ProcessTree } from 'src/app/objects/ProcessTree/ProcessTree';
import { TimeUnit } from 'src/app/objects/TimeUnit';
import { mapVariants } from 'src/app/utils/util';
import { LogService } from '../logService/log.service';
import { VariantService } from '../variantService/variant.service';
import { ProcessTreeService } from './../processTreeService/process-tree.service';
import { VariantElement } from 'src/app/objects/Variants/variant_element';
import { ROUTES } from 'src/app/constants/backend_route_constants';
import { addVariantInformation } from '../variantService/variant-transformation';
import { MiningConfig } from 'src/app/objects/Variants/variant-miner-types';
import { ElectronServiceInterface } from '../electronService/electron.service';
import { ELECTRON_SERVICE } from 'src/app/tokens';
import { InfixType } from 'src/app/objects/Variants/infix_selection';
import { treeConformanceResult } from '../conformanceChecking/model';
import { Variant } from 'src/app/objects/Variants/variant';

@Injectable({
  providedIn: 'root',
})
export class BackendService {
  constructor(
    private httpClient: HttpClient,
    private logService: LogService,
    private variantService: VariantService,
    private processTreeService: ProcessTreeService,
    private sharedDataService: SharedDataService,
    @Inject(ELECTRON_SERVICE) private electronService: ElectronServiceInterface
  ) {}

  exportEventLogFromLog(bids: number[]) {
    this.httpClient
      .post(
        ROUTES.HTTP_BASE_URL + ROUTES.EXPORT + 'exportLogVariants',
        { bids: bids },
        { responseType: 'blob' }
      )
      .pipe(take(1))
      .subscribe((blob) => {
        this.electronService.showSaveDialog(
          'log',
          'xes',
          blob,
          'Save event log',
          'Export event log'
        );
      });
  }

  loadEventLogFromFilePath(filePath: string): void {
    this.httpClient
      .post(ROUTES.HTTP_BASE_URL + ROUTES.IMPORT + 'loadEventLog', {
        file_path: filePath,
      })
      .pipe(mapVariants())
      .subscribe((res) => {
        this.processEventLog(res, filePath);
      });
  }

  uploadEventLog(file: File) {
    let formData = new FormData();
    formData.append('file', file);

    this.httpClient
      .post(ROUTES.HTTP_BASE_URL + ROUTES.IMPORT + 'uploadfile', formData)
      .pipe(mapVariants())
      .subscribe((res) => {
        this.processEventLog(res, file.name);
      });
  }

  // Refractor too Log Service
  private processEventLog(res, filePath = null) {
    console.warn('Processing Event Log', res);

    this.logService.activitiesInEventLog = res['activities'];
    this.logService.startActivitiesInEventLog = new Set(res['startActivities']);
    this.logService.endActivitiesInEventLog = new Set(res['endActivities']);

    const variants = addVariantInformation(res['variants']);
    this.variantService.variants = variants;
    this.variantService.cachedChange = false;

    this.logService.computeLogStats(variants);
    this.logService.loadedEventLog = filePath;
    this.logService.performanceInfoAvailable = true;
    this.logService.timeGranularity = res['timeGranularity'];
    this.logService.logGranularity = res['timeGranularity'];
  }

  loadProcessTreeFromFilePath(filePath: string): void {
    this.httpClient
      .post(
        ROUTES.HTTP_BASE_URL + ROUTES.IMPORT + 'loadProcessTreeFromPtmlFile',
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
    variants: VariantElement[]
  ): Observable<any> {
    const variantsSerialized = variants.map((v) => v.serialize(1));
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
    variantsToAdd: VariantElement[],
    variantsInModelLanguage: VariantElement[]
  ): Observable<any> {
    const body = {
      pt: this.processTreeService.currentDisplayedProcessTree.copy(false),
      variants_to_add: variantsToAdd.map((v) => v.serialize(1)),
      fitting_variants: variantsInModelLanguage.map((v) => v.serialize(1)),
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
    selectedVariants: VariantElement[]
  ): Observable<any> {
    const body = {
      pt: this.processTreeService.currentDisplayedProcessTree.copy(false),
      selected_variants: selectedVariants.map((v) => v.serialize(1)),
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
        this.processEventLog(properties, logName);
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

  public applyTiebreaker(sourcePattern, targetPattern) {
    this.httpClient
      .post(ROUTES.HTTP_BASE_URL + ROUTES.TIEBREAKER + 'apply', {
        sourcePattern: sourcePattern,
        targetPattern: targetPattern,
      })
      .pipe(mapVariants())
      .subscribe((res) => {
        this.processEventLog(res);
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
}
