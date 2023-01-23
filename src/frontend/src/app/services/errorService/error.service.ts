import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ErrorService {
  private apiErrorSubject = new BehaviorSubject<HttpErrorResponse>(
    {} as HttpErrorResponse
  );

  constructor() {}

  public addApiError(err: HttpErrorResponse) {
    this.apiErrorSubject.next(err);
  }

  public getErrors(): Observable<HttpErrorResponse> {
    return this.apiErrorSubject.asObservable();
  }
}
