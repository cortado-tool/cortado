import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const openCloseComponent = trigger('openCloseComponent', [
  // ...
  state(
    'openComponent',
    style({
      height: '75%',
      width: '55%',
      overflow: 'hidden',
    })
  ),
  state(
    'closeComponent',
    style({
      height: '25px',
      width: '125px',
      overflow: 'hidden',
    })
  ),
  transition('openComponent => closeComponent', [animate('175ms')]),
  transition('closeComponent => openComponent', [animate('175ms')]),
]);

export const fadeInOutComponent = trigger('fadeInOutComponent', [
  // ...
  state(
    'fadeInComponent',
    style({
      opacity: '1',
      width: '100%',
      height: '100%',
    })
  ),
  state(
    'fadeOutComponent',
    style({
      opacity: '0',
      width: '0%',
      height: '0%',
    })
  ),
  transition('fadeInComponent => fadeOutComponent', [animate('175ms')]),
  transition('fadeOutComponent => fadeInComponent', [animate('175ms')]),
]);

export const flyInComponent = trigger('flyInDiv', [
  transition(':enter', [
    style({ opacity: '0', transform: 'translateX(40px)' }),
    animate(
      '150ms 50ms ease-in',
      style({ opacity: '1', transform: 'translateX(0)' })
    ),
  ]),
  transition(':leave', [
    animate(
      '150ms 50ms ease-in',
      style({ opacity: '0', transform: 'translateX(50px)' })
    ),
  ]),
]);
