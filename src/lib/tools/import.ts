import { wait } from 'f-promise';
import { IModelFactory } from 'spirit.io/lib/interfaces';
import { ModelRegistry } from 'spirit.io/lib/core';
import * as fs from "mz/fs";
const debug = require('debug')('sio-admin:imports');

export function imports(filePath: string) {
    let _f: any = wait(fs.readFile(filePath, 'utf8'));
    let _import = JSON.parse(_f);
    let models = Object.keys(_import);
    models.forEach(key => {
        let mf: IModelFactory = ModelRegistry.getFactoryByName(key);
        let elts = _import[key];
        elts.forEach(elt => {
            mf.helper.saveInstance(mf.createNew(), elt);
            debug(key + " created with data:", JSON.stringify(elt, null, 2));
        });
    });
}