import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'strFilter',
})
export class StrFilterPipe implements PipeTransform {
  transform(items: any[], searchText: string): any[] {
    if (!items) {
      return [];
    }
    if (!searchText) {
      return items;
    }
    return [searchText].concat(
      items.filter((item) => {
        return item
          .toLocaleLowerCase()
          .includes(searchText.toLocaleLowerCase());
      })
    );
  }
}
