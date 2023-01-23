import {
  Component,
  OnInit,
  ElementRef,
  Inject,
  OnDestroy,
} from '@angular/core';
import { BackgroundTaskInfoService } from '../../services/backgroundTaskInfoService/background-task-info.service';
import packageInfo from '../../../../package.json';
import { DOCUMENT } from '@angular/common';
import { BackendInfoService } from 'src/app/services/backendInfoService/backend-info.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
declare var electron: any;

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'],
})
export class FooterComponent implements OnInit, OnDestroy {
  constructor(
    private backgroundTaskInfoService: BackgroundTaskInfoService,
    private backendInfoService: BackendInfoService,
    private _elRef: ElementRef<HTMLElement>,
    @Inject(DOCUMENT) private document: Document
  ) {}

  currentTask = undefined;
  numberTasks = 0;
  version = packageInfo.version;
  public isRunning: boolean = false;

  private _destroy$ = new Subject();

  ngOnInit(): void {
    this.backgroundTaskInfoService
      .currentBackgroundTask$()
      .pipe(takeUntil(this._destroy$))
      .subscribe((backgroundTask) => {
        this.currentTask = backgroundTask;
      });

    this.backgroundTaskInfoService
      .numberBackgroundTasks$()
      .pipe(takeUntil(this._destroy$))
      .subscribe((res) => {
        this.numberTasks = res;
        if (res > 0) {
          this.document.getElementById('body').style.cursor = 'progress';
        } else if (res == 0) {
          this.document.getElementById('body').style.cursor = '';
        }
      });

    this.backendInfoService
      .getIsRunningSubscription()
      .pipe(takeUntil(this._destroy$))
      .subscribe((isRunning) => (this.isRunning = isRunning));
  }

  ngOnDestroy(): void {
    this._destroy$.next();
  }

  isCancelableTask(): boolean {
    return (
      this.currentTask !== undefined &&
      this.currentTask.CancellationFunc !== null
    );
  }

  cancelCurrentRequest(): void {
    if (this.isCancelableTask()) {
      this.currentTask.CancellationFunc();
    }
  }

  restartBackend(): void {
    this.backendInfoService.setRunning(false);
    (<any>window).electronAPI.requestRestart();
  }

  get element() {
    return this._elRef.nativeElement;
  }
}
