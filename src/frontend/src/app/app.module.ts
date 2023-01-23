import { DropZoneComponent } from './components/drop-zone/drop-zone.component';
import { BrowserModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { ActivityOverviewSortingPipe } from './pipes/activity-overview-sorting/activity-overview-sorting.pipe';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FooterComponent } from './components/footer/footer.component';
import { ProcessTreeEditorComponent } from './components/process-tree-editor/process-tree-editor.component';
import { StrFilterPipe } from './pipes/str-filter/str-filter.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxFileDropModule } from 'ngx-file-drop';
import { ColorPickerModule } from 'ngx-color-picker';

import { VariantExplorerComponent } from './components/variant-explorer/variant-explorer.component';
import { ActivityOverviewComponent } from './components/activity-overview/activity-overview.component';
import { HttpRequestInterceptor } from './interceptors/http-request.interceptor';
import { VariantInfoComponent } from './components/variant-explorer/variant/subcomponents/variant-info/variant-info.component';
import { ModelPerformanceComponent } from './components/performance/performance.component';
import { HumanizeDurationPipe } from './pipes/humanize-duration.pipe';
import { VariantPerformanceComponent } from './components/variant-performance/variant-performance.component';
import { InfoBoxComponent } from './components/info-box/info-box.component';
import { VariantSelectionButtonComponent } from './components/variant-explorer/variant/subcomponents/variant-selection-button/variant-selection-button.component';
import { GoldenLayoutComponentService } from './services/goldenLayoutService/golden-layout-component.service';
import { GoldenLayoutHostComponent } from './components/golden-layout-host/golden-layout-host.component';
import { SubvariantExplorerComponent } from './components/variant-explorer/subvariant-explorer/subvariant-explorer.component';
import { VariantColorMapComponent } from './components/variant-performance/variant-color-map/variant-color-map.component';
import { NodeSelectionPerformanceComponent } from './components/performance/node-selection-performance/node-selection-performance.component';
import { PerformanceTableComponent } from './components/performance/performance-table/performance-table.component';
import { ColorMapComponent } from './components/performance/color-map/color-map.component';
import { TreePerformanceColorMapComponent } from './components/performance/tree-performance-color-map/tree-performance-color-map.component';
import { ExpertModeComponent } from './components/process-tree-editor/expert-mode/expert-mode.component';
import { SettingsComponent } from './components/settings/settings.component';
import { DropZoneDirective } from './directives/drop-zone/drop-zone.directive';
import { TreeStringRendererComponent } from './components/tree-string-renderer/tree-string-renderer.component';
import { VariantEditorComponent } from './components/variant-editor/variant-editor.component';
import { VariantComponent } from './components/variant-explorer/variant/variant.component';
import { VariantConformanceDialogComponent } from './components/variant-explorer/conformance-info/variant-conformance-dialog/variant-conformance-dialog.component';
import { BpmnEditorComponent } from './components/bpmn-editor/bpmn-editor.component';
import { GoldenLayoutDummyComponent } from './components/golden-layout-host/golden-layout-dummy/golden-layout-dummy.component';
import { SubVariantComponent } from './components/variant-explorer/subvariant-explorer/subvariants/sub-variant/sub-variant.component';
import { ActivityButtonAreaComponent } from './components/variant-editor/activity-button-area/activity-button-area.component';
import { HeaderBarComponent } from './components/header-bar/header-bar.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { DialogModule } from './components/dialogs/dialog.module';
import { VariantMinerComponent } from './components/variant-miner/variant-miner.component';
import { VariantMinerPatternComponent } from './components/variant-miner/variant-miner-pattern/variant-miner-pattern.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { VariantQueryComponent } from './components/variant-explorer/variant-query/variant-query.component';
import { ConformanceInfoBarComponent } from './components/variant-explorer/conformance-info/info-bar/conformance-info-bar.component';
import { initApp, InitService } from './services/init.service';
import { ToastComponent } from './components/toast/toast/toast.component';
import { ToasterComponent } from './components/toast/toaster/toaster.component';
import { PerformanceProgressBarComponent } from './components/performance/performance-progress-bar/performance-progress-bar.component';
import { VariantQueryInfoComponent } from './components/variant-explorer/variant-query/query-info/variant-query-info/variant-query-info.component';
import { VariantExplorerContextMenuComponent } from './components/variant-explorer/variant-explorer-context-menu/variant-explorer-context-menu.component';
import { SyntaxHighlightedTextareaDirective } from './directives/syntax-highlighted-textarea/syntax-highlighted-textarea.directive';
import { VariantDrawerDirective } from './directives/variant-drawer/variant-drawer.directive';
import { ProcessTreeDrawerDirective } from './directives/process-tree-drawer/process-tree-drawer.directive';
import { BpmnDrawerDirective } from './directives/bpmn-drawer/bpmn-drawer.directive';
import { TreePerformanceButtonComponent } from './components/variant-explorer/variant/subcomponents/tree-buttons/tree-performance-button/tree-performance-button.component';
import { InfixSelectionControllsComponent } from './components/variant-explorer/variant/subcomponents/infix-selection-controlls/infix-selection-controlls.component';
import { ZoomFieldComponent } from './components/zoom-field/zoom-field.component';
import { VariantExplorerSidebarComponent } from './components/variant-explorer/variant-explorer-sidebar/variant-explorer-sidebar.component';
import { EditorZoneComponent } from './components/editor-zone/editor-zone.component';
import { FilterOptionsComponent } from './components/variant-miner/filter-options/filter-options.component';
import { ResizeableTableHeaderComponent } from './components/resizeable-table-header/resizeable-table-header.component';
import { ResizeColumnDirective } from './directives/resize-column.directive';
import { VariantDeleteButtonComponent } from './components/variant-explorer/variant/subcomponents/variant-delete-button/variant-delete-button.component';
import { ELECTRON_SERVICE } from './tokens';
import { ElectronService } from './services/electronService/electron.service';
import { UnavailableInfoComponent } from './components/unavailable-info/unavailable-info.component';
import { ConformanceTabComponent } from './components/conformance-tab/conformance-tab.component';
import { ConformanceStatusIconComponent } from './components/variant-explorer/variant/subcomponents/variant-info/conformance-status-icon/conformance-status-icon.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TiebreakerComponent } from './components/variant-explorer/tiebreaker/tiebreaker.component';
import { TreeConformanceButtonComponent } from './components/variant-explorer/variant/subcomponents/tree-buttons/tree-conformance-button/tree-conformance-button.component';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    StrFilterPipe,
    EditorZoneComponent,
    ActivityOverviewSortingPipe,
    GoldenLayoutHostComponent,
    VariantExplorerComponent,
    VariantInfoComponent,
    ModelPerformanceComponent,
    HumanizeDurationPipe,
    VariantPerformanceComponent,
    InfoBoxComponent,
    ActivityOverviewComponent,
    ProcessTreeEditorComponent,
    SubvariantExplorerComponent,
    VariantInfoComponent,
    VariantColorMapComponent,
    VariantSelectionButtonComponent,
    VariantQueryComponent,
    ActivityOverviewComponent,
    NodeSelectionPerformanceComponent,
    PerformanceTableComponent,
    ColorMapComponent,
    TreePerformanceColorMapComponent,
    VariantInfoComponent,
    ExpertModeComponent,
    SettingsComponent,
    DropZoneComponent,
    DropZoneDirective,
    VariantConformanceDialogComponent,
    TreeStringRendererComponent,
    VariantEditorComponent,
    VariantDrawerDirective,
    SyntaxHighlightedTextareaDirective,
    ActivityButtonAreaComponent,
    VariantComponent,
    BpmnEditorComponent,
    SubVariantComponent,
    HeaderBarComponent,
    GoldenLayoutDummyComponent,
    VariantMinerComponent,
    VariantMinerPatternComponent,
    ConformanceInfoBarComponent,
    VariantQueryInfoComponent,
    ToastComponent,
    ToasterComponent,
    PerformanceProgressBarComponent,
    VariantExplorerContextMenuComponent,
    ProcessTreeDrawerDirective,
    BpmnDrawerDirective,
    TreePerformanceButtonComponent,
    InfixSelectionControllsComponent,
    ZoomFieldComponent,
    VariantExplorerSidebarComponent,
    FilterOptionsComponent,
    ResizeableTableHeaderComponent,
    ResizeColumnDirective,
    VariantDeleteButtonComponent,
    UnavailableInfoComponent,
    ConformanceTabComponent,
    ConformanceStatusIconComponent,
    TiebreakerComponent,
    TreeConformanceButtonComponent,
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    NgxFileDropModule,
    BrowserAnimationsModule,
    ColorPickerModule,
    SweetAlert2Module.forRoot(),
    DialogModule,
    NgxSliderModule,
    NgbModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpRequestInterceptor,
      multi: true,
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [InitService],
      multi: true,
    },
    { provide: ELECTRON_SERVICE, useClass: ElectronService },

    GoldenLayoutComponentService,
  ],
  entryComponents: [
    VariantExplorerComponent,
    ActivityOverviewComponent,
    ProcessTreeEditorComponent,
    VariantInfoComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
