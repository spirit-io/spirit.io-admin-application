import { model } from 'spirit.io/lib/decorators';
import { ModelBase } from 'spirit.io/lib/base';
import * as sessions from '../sessions';

@model({ datasource: 'redis:sessions' })
export class Session extends ModelBase {
    cookie: Object;
    user: string;
    data: Object;

    static destroy(params: any): Object {
        let store = sessions.getSessionStore();
        store.destroy(params._id);
        return {
            $diagnoses: [{
                $severity: "success",
                $message: "Session destroyed successfully"
            }]
        };
    }
}