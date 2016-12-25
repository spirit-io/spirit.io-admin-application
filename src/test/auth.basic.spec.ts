import { Fixtures } from './fixtures';
import { Server } from 'spirit.io/lib/application';
import { setup } from 'f-mocha';
import { expect } from 'chai';

// this call activates f-mocha wrapper.
setup();

let server: Server;

describe('Basic authentication:', () => {

    before(function (done) {
        this.timeout(10000);
        server = Fixtures.setup(done);
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

});