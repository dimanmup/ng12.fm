import {Pipe} from '@angular/core';
 
@Pipe({
    name: 'sizeFormat'
})
export class SizeFormat {
    transform(value: number,
        devider: number = 1): string {
            value /= devider;
        return value.toFixed(3).toLocaleString();
    }
}