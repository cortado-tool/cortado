import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { ViewMode } from 'src/app/objects/ViewMode';

@Injectable({
  providedIn: 'root',
})
export class ModelViewModeService {
  private _viewMode: BehaviorSubject<ViewMode> = new BehaviorSubject<ViewMode>(
    ViewMode.STANDARD
  );

  set viewMode(nextViewMode: ViewMode) {
    if (this.viewMode !== nextViewMode) {
      this._viewMode.next(nextViewMode);
    }
  }

  get viewMode() {
    return this._viewMode.value;
  }

  get viewMode$() {
    return this._viewMode.pipe(distinctUntilChanged());
  }
}
