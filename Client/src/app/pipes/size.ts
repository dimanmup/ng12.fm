import {Pipe} from '@angular/core';
 
@Pipe({
    name: 'sizePipe'
})
export class SizePipe {
    transform(value: number,
        devider: number = 1): string {
            value /= devider;
        return value.toFixed(3).toLocaleString();
    }
}