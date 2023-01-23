import { Pipe, PipeTransform } from '@angular/core';
import { ActivityField } from 'src/app/components/activity-overview/activity-overview.component';

@Pipe({
  name: 'activityOverviewSorting',
})
export class ActivityOverviewSortingPipe implements PipeTransform {
  transform(array: any, sortKey: string, ascending: boolean): any {
    if (!Array.isArray(array)) {
      throw new Error('Input Data is not a sortable Array');
    }

    // Reverse behavior for string keys
    if (sortKey == 'activityName') {
      ascending = !ascending;
    }

    array.sort((a: ActivityField, b: ActivityField) => {
      if (a[sortKey] < b[sortKey]) {
        return ascending ? -1 : 1;
      } else if (a[sortKey] > b[sortKey]) {
        return ascending ? 1 : -1;
      } else {
        return 0;
      }
    });

    return array;
  }
}
