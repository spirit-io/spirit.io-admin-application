import { Fixtures } from './fixtures';
import { Server } from 'spirit.io/lib/application';
import { AdminHelper } from 'spirit.io/lib/core';
import * as authHelper from '../lib/auth/helper';

import { User } from '../lib/models/user';
import { Role } from '../lib/models/role';
import { Session } from '../lib/models/session';

import { setup } from 'f-mocha';

const expect = require('chai').expect;

// this call activates f-mocha wrapper.
setup();

let server: Server;

describe('Users admin app tests:', () => {

    before(function (done) {
        this.timeout(10000);
        server = Fixtures.setup(done);
    });


    it('Import init data should work as expected', () => {

        let roles: Role[] = AdminHelper.model(Role).fetchInstances();
        expect(roles.length).to.equal(1);
        expect(roles[0].code).to.equal('admin');
        expect(roles[0].description).to.equal('Administrator');

        let users: User[] = AdminHelper.model(User).fetchInstances();
        expect(users.length).to.equal(1);
        expect(users[0].login).to.equal('admin');
        expect(users[0].salt).to.be.not.null;
        expect(users[0].password).to.equal(authHelper.sha512('admin', users[0].salt).hash);
        expect(users[0].lastName).to.equal('Administrator');
        expect(users[0].email).to.equal('admin@admin-spirit.io.com');
    });

    it('Authentication with bad credentials should fail', () => {
        let resp = Fixtures.post('/login', null, {
            authorization: 'Basic ' + new Buffer('badUser:badPwd', 'utf8').toString('base64')
        });
        let body = JSON.parse(resp.body);
        expect(resp.status).to.equal(401);
        expect(body.$diagnoses).to.be.a('array');
        expect(body.$diagnoses.length).to.equal(1);
        expect(body.$diagnoses[0].$severity).to.equal("error");
        expect(body.$diagnoses[0].$message).to.equal("User 'badUser' not found");
    });

    it('Authentication with bad password should fail', () => {
        let resp = Fixtures.post('/login', null, {
            authorization: 'Basic ' + new Buffer('admin:badPassword', 'utf8').toString('base64')
        });
        let body = JSON.parse(resp.body);
        expect(resp.status).to.equal(401);
        expect(body.$diagnoses).to.be.a('array');
        expect(body.$diagnoses.length).to.equal(1);
        expect(body.$diagnoses[0].$severity).to.equal("error");
        expect(body.$diagnoses[0].$message).to.equal("Wrong password !");
    });

    let cookies = [];
    it('Authentication with correct credentials should work', () => {
        const auth = 'Basic ' + new Buffer('admin:admin', 'utf8').toString('base64');
        let resp = Fixtures.post('/login', null, {
            authorization: auth
        });
        let body = JSON.parse(resp.body);
        expect(resp.status).to.equal(200);
        expect(body.$diagnoses).to.be.a('array');
        expect(body.$diagnoses.length).to.equal(1);
        expect(body.$diagnoses[0].$severity).to.equal("info");
        expect(body.$diagnoses[0].$message).to.equal("User 'admin' logged in successfully");
        // store cookie
        cookies.push(resp.headers['set-cookie'][0]);
        // second login for incrementing sessions count
        resp = Fixtures.post('/login', null, {
            authorization: auth
        });
        cookies.push(resp.headers['set-cookie'][0]);
    });

    it('Sessions count should be ok', () => {
        let db = AdminHelper.model(Session);
        expect(db.fetchInstances().length).to.equal(2);
    });

    it('Request without cookie or authentication header should fail', () => {
        let resp = Fixtures.get('/api/v1/user');
        let body = JSON.parse(resp.body);
        expect(resp.status).to.equal(401);
        expect(body.$diagnoses).to.be.a('array');
        expect(body.$diagnoses.length).to.equal(1);
        expect(body.$diagnoses[0].$severity).to.equal("error");
        expect(body.$diagnoses[0].$message).to.equal("AUTHENTICATION_REQUIRED");
    });

    it('Request with cookie should be ok', () => {
        let resp = Fixtures.get('/api/v1/user', {
            cookie: cookies[0]
        });
        let body = JSON.parse(resp.body);
        expect(resp.status).to.equal(200);
        expect(body.length).to.equal(1);
        expect(body[0].login).to.equal('admin');
    });

    it('Delete session should be ok', () => {
        let sid = cookies[1].match(/s%3A(.*)\./)[1];
        let resp = Fixtures.delete('/api/v1/session/' + sid, {
            cookie: cookies[0]
        });
        expect(resp.status).to.equal(204);
    });

    it('Request with deleted session id should fail', () => {
        let resp = Fixtures.get('/api/v1/session', {
            cookie: cookies[1]
        });
        let body = JSON.parse(resp.body);
        expect(resp.status).to.equal(401);
        expect(body.$diagnoses).to.be.a('array');
        expect(body.$diagnoses.length).to.equal(1);
        expect(body.$diagnoses[0].$severity).to.equal("error");
        expect(body.$diagnoses[0].$message).to.equal("AUTHENTICATION_REQUIRED");
    });

    it('Session should have been deleted from datastore', () => {
        let sid = cookies[0].match(/s%3A(.*)\./)[1];
        let resp = Fixtures.get('/api/v1/session', {
            cookie: cookies[0]
        });
        let body = JSON.parse(resp.body);
        expect(resp.status).to.equal(200);
        expect(body.length).to.equal(1);
        expect(body[0]._id).to.equal(sid);
        expect(body[0].user).to.equal('admin');
    });
});