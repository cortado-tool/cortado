import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

export const collapsingText = trigger('collapseText', [
  transition(':enter', [
    style({ opacity: '0', transform: 'translateX(-40px)' }),
    animate(
      '100ms 50ms ease-in',
      style({ opacity: '1', transform: 'translateX(0)' })
    ),
  ]),
  transition(':leave', [
    animate(
      '100ms 50ms ease-in',
      style({ opacity: '0', transform: 'translateX(-50px)' })
    ),
  ]),
]);

export const expandCollapsed = trigger('expandCollapse', [
  state(
    'void',
    style({
      height: '0px',
    })
  ),
  state(
    '*',
    style({
      height: '*',
    })
  ),
  transition('void => *', animate('150ms ease-out')),
  transition('* => void', animate('150ms ease-in')),
]);

export const fadeInText = trigger('fadeIn', [
  transition(':enter', [
    style({ opacity: '0' }),
    animate('100ms 50ms ease-in', style({ opacity: '1' })),
  ]),
  transition(':leave', [
    animate('550ms 50ms ease-in', style({ opacity: '0' })),
  ]),
]);
