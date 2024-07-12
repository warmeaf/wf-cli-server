const Mongo = require('./mongo');
const { MongodbUrl, MongodbName } = require('../config/db');

function mongo() {
  return new Mongo(MongodbUrl, MongodbName);
}

module.exports = mongo;

