const moment = require('moment');

module.exports = {
  format: (dateStr, fmt) => moment(dateStr).format(fmt),
};
