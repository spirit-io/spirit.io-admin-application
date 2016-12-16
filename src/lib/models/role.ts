import { collection, unique, required, index, reverse, embedded } from 'spirit.io/lib/decorators';
import { ModelBase } from 'spirit.io/lib/base';

@collection()
export class Role extends ModelBase {
    constructor(data) {
        super(data);
    }
    code: string
    description: string;
}