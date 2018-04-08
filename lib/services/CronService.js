const { CronJob } = require('cron');

exports.validateCronTime = (cronTime) => {
  try {
    const job = new CronJob({ cronTime });
    return job;
  } catch (ex) {
    throw new Error('Invalid Cron Pattern');
  }
};

exports.instance = (cronTime, onTick, onComplete, opts = {}) => {
  exports.validateCronTime(cronTime);
  const {
    start = false,
    timeZone,
    runOnInit = false,
  } = opts;

  const job = new CronJob({
    cronTime,
    start,
    timeZone,
    onTick,
    onComplete,
    runOnInit,
  });
  return job;
};
