const chai = require('chai');
const chaiHTTP = require('chai-http');
const { server } = require('../src/app');

chai.should();
chai.use(chaiHTTP);
chai.use(require('chai-like'));
chai.use(require('chai-things'));
chai.use(require('chai-json-schema'));

module.exports = {
    chai,
    server,
    expect: chai.expect
};
