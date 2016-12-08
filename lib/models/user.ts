import { _ } from 'streamline-runtime';
import { collection, unique, required, index, reverse, embedded, invisible, hook } from 'spirit.io/lib/decorators';
import { ModelBase } from 'spirit.io/lib/base';
import { IModelHelper } from 'spirit.io/lib/interfaces';
import { AdminHelper } from 'spirit.io/lib/core';
import * as authHelper from '../auth/helper';
import { Role } from './role';

@collection()
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

    @required @invisible
    password: string;

    @invisible
    salt: string;

    role: Role;

    @hook('beforeSave')
    static beforeSave(_, user: User) {
        let helper: IModelHelper = AdminHelper.model('User');
        if (user.isModified('password') || user.getMetadata('$isCreated')) {
            var salt = authHelper.genRandomString(16); /** Gives us salt of length 16 */
            var shaPwd = authHelper.sha512(user.password, salt);
            user.password = shaPwd.hash;
            user.salt = salt;
        }
    }
}