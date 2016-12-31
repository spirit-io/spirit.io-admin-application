import { model, required } from 'spirit.io/lib/decorators';
import { unique } from 'spirit.io-mongodb-connector/lib/decorators';
import { ModelBase } from 'spirit.io/lib/base';

@model()
export class Role extends ModelBase {
    constructor(data) {
        super(data);
    }
    @required
    @unique
    code: string
    description: string;
}