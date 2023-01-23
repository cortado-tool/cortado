import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { TimeUnit } from 'src/app/objects/TimeUnit';
import { BackendService } from 'src/app/services/backendService/backend.service';
import { LogService } from 'src/app/services/logService/log.service';
import { SettingsService } from 'src/app/services/settingsService/settings.service';
import { SharedDataService } from 'src/app/services/sharedDataService/shared-data.service';
import { Configuration } from './model';

declare var $: any;

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  @Input()
  showSettings: Observable<void>;
  configForm: FormGroup;

  configuration: Configuration = new Configuration();

  private _destroy$ = new Subject();

  constructor(
    private backendService: BackendService,
    private settingsService: SettingsService,
    private logService: LogService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.showSettings
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => this.showModal());
    this.configForm = this.fb.group({
      timeoutCVariantAlignmentComputation: [null, Validators.required],
      minTracesVariantDetectionMultiprocessing: [null, Validators.required],
      isNSequentializationReductionEnabled: [null, Validators.required],
      numberOfSequentializationsPerVariant: [null, Validators.required],
      // timeGranularity: [null, Validators.required],
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  onGranularityChange(event) {
    this.logService.timeGranularity = event;
  }

  showModal(): void {
    this.backendService
      .getConfiguration()
      .pipe(
        tap((config) => {
          this.settingsService.notify(config);
        })
      )
      .pipe(takeUntil(this._destroy$))
      .subscribe((config) => {
        this.configForm.patchValue(config);
        $('#settingsModalDialog').modal('show');
      });
  }

  hideModal(): void {
    document.getElementById('close-modal').click();
  }

  saveChanges(): void {
    this.backendService
      .saveConfiguration(this.configForm.getRawValue())
      .pipe(
        tap(() => this.settingsService.notify(this.configForm.getRawValue()))
      )
      .pipe(takeUntil(this._destroy$))
      .subscribe((_) => {
        this.hideModal();
      });
  }
}
