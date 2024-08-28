const { server, chai, expect } = require('../test/00-setup.spec');

describe('Login test', () => {
    it('Login in to salesforce', (done) => {
        chai.request(server)
            .get('/login')
            .end((err, res) => {
                if (err) return done(err);

                expect(res).to.have.status(200)
                done()
            })
    })
})