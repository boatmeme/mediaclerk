const { cronsFromConfig, loadConfigFromPath } = require('./lib/services/MediaClerkService');
const moment = require('moment-timezone');
const { flatten } = require('./lib/util/ArrayUtils');

const cronOpts = {
  timeZone: moment.tz.guess(),
};

const loadConfigs = paths => flatten(paths.map(loadConfigFromPath));
const [one, two, ...configPaths] = process.argv; // eslint-disable-line no-unused-vars

try {
  const configs = loadConfigs(configPaths);
  const jobs = cronsFromConfig(configs, cronOpts);
  jobs.forEach(j => j.start());
} catch (err) {
  // eslint-disable-next-line
  console.error(err);
  process.exit(1);
}
