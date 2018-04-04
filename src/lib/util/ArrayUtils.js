const groupBy = require('lodash.groupby');
const flatten = require('lodash.flatten');
const orderBy = require('lodash.orderby');
const isEmpty = require('lodash.isempty');
const isArray = require('lodash.isarray');
const compact = require('lodash.compact');
const { mapSequence } = require('prolly');

module.exports = {
  compact,
  isArray,
  isEmpty,
  groupBy,
  orderBy,
  flatten,
  mapSequence,
};
