import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiErrorDialogComponent } from './api-error-dialog/api-error-dialog.component';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ClipboardModule } from 'ngx-clipboard';
import { SharedDirectivesModule } from 'src/app/directives/shared-directives/shared-directives.module';

@NgModule({
  declarations: [ApiErrorDialogComponent],
  imports: [
    CommonModule,
    SweetAlert2Module.forChild(),
    ClipboardModule,
    SharedDirectivesModule,
  ],
  exports: [ApiErrorDialogComponent],
})
export class DialogModule {}
