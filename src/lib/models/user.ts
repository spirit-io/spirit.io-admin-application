import { model, required, invisible, hook } from 'spirit.io/lib/decorators';
import { unique } from 'spirit.io-mongodb-connector/lib/decorators';
import { ModelBase } from 'spirit.io/lib/base';
import * as authHelper from '../auth/helper';
import { Role } from './role';

@model()
export class User extends ModelBase {

    constructor(data) {
        super(data);
    }

    @unique @required
    login: string

    firstName: string;

    @required
    lastName: string;

    @unique @required
    email: string;

    @required @invisible(true)
    password: string;

    @invisible(true)
    salt: string;

    role: Role;

    @hook('beforeSave')
    static beforeSave(user: User) {
        if (user.isModified('password') || user.getMetadata('$isCreated')) {
            var salt = authHelper.genRandomString(16); /** Gives us salt of length 16 */
            var shaPwd = authHelper.sha512(user.password, salt);
            user.password = shaPwd.hash;
            user.salt = salt;
        }
    }
}