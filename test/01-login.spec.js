const { sinon, jsforce, server, chai, expect } = require('../src/imports');

describe('Login test', () => {
    let authUrlStub, authorizeStub;

    before(() => {
        authUrlStub = sinon.stub(jsforce.OAuth2.prototype, 'getAuthorizationUrl').returns('https://login.salesforce.com/services/oauth2/authorize');
        authorizeStub = sinon.stub(jsforce.Connection.prototype, 'authorize').resolves({});
    });

    after(() => {
        authUrlStub.restore();
        authorizeStub.restore();
    });

    it('Redirects to Salesforce login', (done) => {
        chai.request(server)
            .get('/authorize')
            .end((err, res) => {
                expect(res).to.redirectTo(/^https:\/\/login.salesforce.com\/services\/oauth2\/authorize/);
                done();
            });
    });

    it('Handles OAuth redirect', (done) => {
        chai.request(server)
            .get('/OauthRedirect')
            .query({ code: 'test_code' })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.text).to.equal('success');
                done();
            });
    });
});