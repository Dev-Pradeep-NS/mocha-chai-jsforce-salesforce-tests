const { server, chai, expect } = require('../test/00-setup.spec');

describe('Account test', function () {
    it('GET /accounts should return accounts with valid schema', function (done) {
        chai.request(server)
            .get('/accounts')
            .end(function (err, res) {
                if (err) return done(err);

                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array').that.is.not.empty;
                const accountSchema = {
                    title: "Account schema",
                    type: "object",
                    required: ["Id", "Name", "Industry"],
                    properties: {
                        Id: {
                            type: "string"
                        },
                        Name: {
                            type: "string"
                        },
                        Industry: {
                            type: ["string", "null"]
                        }
                    }
                };
                res.body.forEach(account => {
                    expect(account).to.be.jsonSchema(accountSchema);
                });

                done();
            });
    });
});
