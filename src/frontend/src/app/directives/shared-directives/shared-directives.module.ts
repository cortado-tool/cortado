import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StopEventPropagationDirective } from './stop-event-propagation.directive';
@NgModule({
  declarations: [StopEventPropagationDirective],
  imports: [CommonModule],
  exports: [StopEventPropagationDirective],
})
export class SharedDirectivesModule {}
