import { model } from 'spirit.io/lib/decorators';
import { ModelBase } from 'spirit.io/lib/base';

@model()
export class Role extends ModelBase {
    constructor(data) {
        super(data);
    }
    code: string
    description: string;
}