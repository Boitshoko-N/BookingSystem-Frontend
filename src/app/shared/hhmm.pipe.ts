import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'hhmm' })
export class HhmmPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    return value ? value.slice(0, 5) : '';
  }
}