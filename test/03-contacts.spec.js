const { sinon, jsforce, server, chai, expect } = require('../src/imports');

describe('Contact test', function () {
    let createStub, updateStub, deleteStub;
    let sobjectStub;

    before(function () {
        sobjectStub = sinon.stub(jsforce.Connection.prototype, 'sobject');

        createStub = sinon.stub();

        createStub.withArgs(sinon.match.object)
            .onFirstCall().resolves({ id: '0032v00002LKVYrAAP' })
            .onSecondCall().rejects(new Error('Creation error'));

        createStub.withArgs(sinon.match.array).resolves([
            { success: true, id: '0032v00002LKVYrAAP' },
            { success: true, id: '0032v00002LKVYrABQ' }
        ]);

        updateStub = sinon.stub().resolves([
            { success: true, id: '0032v00002LKVYrAAP' },
            { success: true, id: '0032v00002LKVYrABQ' }
        ]);

        deleteStub = sinon.stub().resolves({
            success: true
        });
        sobjectStub.returns({ create: createStub, update: updateStub, delete: deleteStub });
    });

    after(function () {
        sobjectStub.restore();
    });

    it('POST /contact should create a contact and return the ID', function (done) {
        chai.request(server)
            .post('/contact')
            .send({
                FirstName: 'Jane',
                LastName: 'Doe',
                Email: 'test@test.com'
            })
            .end(function (err, res) {
                expect(res).to.have.status(201);
                expect(res.body).to.have.property('id', '0032v00002LKVYrAAP');
                done();
            });
    });

    it('POST /contacts/createMultiple should create multiple contacts and return reaults', function (done) {
        const recordsToCreate = [
            { Id: '0032v00002LKVYrAAP', FirstName: 'Jane', LastName: 'Doe', Email: 'updated@test.com' },
            { Id: '0032v00002LKVYrABQ', FirstName: 'John', LastName: 'Smith', Email: 'john.smith@test.com' }
        ];
        chai.request(server)
            .post('/contacts/createMultiple')
            .send({ records: recordsToCreate })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(2);
                expect(res.body[0]).to.deep.equal({ success: true, id: '0032v00002LKVYrAAP' });
                expect(res.body[1]).to.deep.equal({ success: true, id: '0032v00002LKVYrABQ' });
                done();
            });
    })

    it('POST /contact should return 400 if required fields are missing', function (done) {
        chai.request(server)
            .post('/contact')
            .send({})
            .end(function (err, res) {
                expect(res).to.have.status(400);
                expect(res.text).to.equal('Missing required fields');
                done();
            });
    });

    it('POST /contact should return 500 if there is an error creating the contact', function (done) {
        chai.request(server)
            .post('/contact')
            .send({
                FirstName: 'Jane',
                LastName: 'Doe',
                Email: 'test@test.com'
            })
            .end(function (err, res) {
                expect(res).to.have.status(500);
                expect(res.text).to.equal('An error occurred');
                done();
            });
    });

    it('PUT /contact/:id should update a contact and return success', function (done) {
        const contactId = '0032v00002LKVYrAAP';
        chai.request(server)
            .put(`/contact/${contactId}`)
            .send({
                FirstName: 'Jane',
                LastName: 'Doe',
                Email: 'updated@test.com'
            })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('success', true);
                expect(res.body).to.have.property('id', contactId);
                done();
            });
    });

    it('PUT /contact/:id should return 400 if required fields are missing', function (done) {
        const contactId = '0032v00002LKVYrAAP';
        chai.request(server)
            .put(`/contact/${contactId}`)
            .send({})
            .end(function (err, res) {
                expect(res).to.have.status(400);
                expect(res.text).to.equal('Missing required fields');
                done();
            });
    });

    it('PUT /contact/:id should return 500 if there is an error updating the contact', function (done) {
        updateStub.rejects(new Error('Update error'));
        const contactId = '0032v00002LKVYrAAP';
        chai.request(server)
            .put(`/contact/${contactId}`)
            .send({
                FirstName: 'Jane',
                LastName: 'Doe',
                Email: 'updated@test.com'
            })
            .end(function (err, res) {
                expect(res).to.have.status(500);
                expect(res.text).to.equal('An error occurred');
                done();
            });
    });

    it('PUT /contacts/updateMultiple should update multiple contacts and return results', function (done) {
        const recordsToUpdate = [
            { Id: '0032v00002LKVYrAAP', FirstName: 'Jane', LastName: 'Doe', Email: 'updated@test.com' },
            { Id: '0032v00002LKVYrABQ', FirstName: 'John', LastName: 'Smith', Email: 'john.smith@test.com' }
        ];

        updateStub.resolves([
            { success: true, id: '0032v00002LKVYrAAP' },
            { success: true, id: '0032v00002LKVYrABQ' }
        ]);

        chai.request(server)
            .put('/contacts/updateMultiple')
            .send({ records: recordsToUpdate })
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('array');
                expect(res.body).to.have.lengthOf(2);
                expect(res.body[0]).to.deep.equal({ success: true, id: '0032v00002LKVYrAAP' });
                expect(res.body[1]).to.deep.equal({ success: true, id: '0032v00002LKVYrABQ' });
                done();
            });
    });

    it('Delete /contact/:id should delete a contact and return success', function (done) {
        const contactId = '0032v00002LKVYrAAP';
        chai.request(server)
            .delete(`/contact/${contactId}`)
            .end(function (err, res) {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property('success', true);
                done()
            })
    })
});