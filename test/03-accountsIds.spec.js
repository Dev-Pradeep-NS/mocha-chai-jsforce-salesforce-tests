const { server, chai, expect } = require('../test/00-setup.spec');

describe('GET /accounts/ids', () => {
    let accountIds;

    before(async () => {
        const res = await chai.request(server).get('/accounts');
        accountIds = res.body.map(account => account.Id).join(',');
        console.log(accountIds);
    });

    it('should return accounts by IDs', async () => {
        const res = await chai.request(server).get(`/accounts/ids?ids=${accountIds}`);
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.an('array');
        res.body.length.should.be.at.least(1);
        res.body[0].should.have.property('Id');
        res.body[0].should.have.property('Name');
        res.body[0].should.have.property('Industry');
    });

    it('should return 400 if no IDs are provided', async () => {
        const res = await chai.request(server).get('/accounts/ids');
        res.should.have.status(400);
        res.text.should.equal('No IDs provided');
    });
});
