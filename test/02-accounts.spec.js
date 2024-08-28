const { sinon, jsforce, server, chai, expect } = require('../src/imports');

describe('Account test', function () {
    let queryStub;

    before(function () {
        queryStub = sinon.stub(jsforce.Connection.prototype, 'query').resolves({
            records: [
                { Id: '001', Name: 'Test Account 1', Industry: 'Technology' }
            ]
        });
    });

    after(function () {
        queryStub.restore();
    });

    it('GET /accounts should return accounts with valid schema', function (done) {
        chai.request(server)
            .get('/accounts')
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array').that.is.not.empty;

                const accountSchema = {
                    title: "Account schema",
                    type: "object",
                    required: ["Id", "Name", "Industry"],
                    properties: {
                        Id: { type: "string" },
                        Name: { type: "string" },
                        Industry: { type: ["string", "null"] }
                    }
                };

                res.body.forEach(account => {
                    expect(account).to.be.jsonSchema(accountSchema);
                });

                done();
            });
    });
});


describe('GET /accounts/ids', function () {
    let queryStub;

    before(function () {
        queryStub = sinon.stub(jsforce.Connection.prototype, 'query').callsFake((query) => {
            const ids = query.match(/'([^']+)'/g).map(id => id.replace(/'/g, ''));
            return Promise.resolve({
                records: ids.map(id => ({ Id: id, Name: `Test Account ${id}`, Industry: 'Technology' }))
            });
        });
    });

    after(function () {
        queryStub.restore();
    });

    it('should return accounts by IDs', async function () {
        const accountIds = '001,002';
        const res = await chai.request(server)
            .get(`/accounts/ids?ids=${accountIds}`);

        expect(res).to.have.status(200);
        expect(res).to.be.json;
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(2);
        expect(res.body[0]).to.have.property('Id');
        expect(res.body[0]).to.have.property('Name');
        expect(res.body[0]).to.have.property('Industry');
    });

    it('should return 400 if no IDs are provided', async function () {
        const res = await chai.request(server)
            .get('/accounts/ids');

        expect(res).to.have.status(400);
        expect(res.text).to.equal('No IDs provided');
    });
});
