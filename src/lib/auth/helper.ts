import { HttpError } from 'spirit.io/lib/utils';

const crypto = require('crypto');


/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */
export function genRandomString(length: number) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0, length);   /** return required number of characters */
};

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
export function sha512(password: string, salt: string) {
    let hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    let value = hash.digest('hex');
    return {
        salt: salt,
        hash: value
    };
};

export function badRequest(text: string): HttpError {
    return new HttpError(400, text);
}

export function badAuthMethod(authMethod: string): HttpError {
    return badRequest("Bad authentication method: " + authMethod);
}

export function unauthorized(): HttpError {
    return new HttpError(401, 'Authorization required');
}
