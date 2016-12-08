import { _ } from 'streamline-runtime';
import { Request, Response } from "express";
import { IModelHelper } from 'spirit.io/lib/interfaces';
import { AdminHelper } from 'spirit.io/lib/core';
import * as helper from './helper';
import { IAuthModule } from './interfaces';
import { HttpError } from 'spirit.io/lib/common';

let singleton: Basic;

class Basic implements IAuthModule {
    authenticate(req: Request, res: Response, _: _): string {

        let credentials = /^basic\s([\w\+\/]+\=*)/i.exec(req.headers['authorization']);
        if (!credentials || credentials.length === 0) throw helper.unauthorized();

        let str = new Buffer(credentials[1], "base64").toString("utf8");
        if (str.indexOf(':') === -1) throw helper.unauthorized();
        let parts = str.split(':');
        var login = parts[0];
        var pwd = parts[1];

        let userHelper: IModelHelper = AdminHelper.model('User');
        let user = userHelper.fetchInstance(_, { login: login });
        if (!user) throw new Error(`User '${login}' not found`);
        let salt = user.salt;
        let truePwd = user.password;
        var shaPwd = helper.sha512(pwd, salt);
        if (shaPwd.hash !== truePwd) throw new Error("Wrong password !");
        return login;
    }
}

module.exports = function () {
    if (singleton) return singleton;
    singleton = new Basic();
    return singleton;
}