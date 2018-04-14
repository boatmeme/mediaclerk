const moment = require('moment');
const fs = require('fs');
const prettyBytes = require('pretty-bytes');
const { toString: prettyCron } = require('prettycron');
const { instance: cron } = require('./CronService');
const { compact, isEmpty } = require('../util/ArrayUtils');
const imageExtensions = require('image-extensions');
const videoExtensions = require('video-extensions');
const {
  organize,
  organizeByDate,
  organizeByExtension,
  organizeByAlphabetical,
} = require('fileclerk');

const asArray = maybeArr => (Array.isArray(maybeArr) ? maybeArr : [maybeArr]);

const buildOptions = (config) => {
  const {
    byDate,
    byAlphabetical,
    byType,
    byExtension,
    byCustom,
  } = config;

  // Check for more than one defined - can't do it
  const check = compact([byDate, byAlphabetical, byType, byExtension, byCustom]);
  if (check.length > 1) throw new Error('Cannot define more than one of byDate, byAlphabetical, byType, or byExtension, byCustom');

  const options = (byCustom
    || byDate
    || byType
    || byAlphabetical
    || byExtension
    || {
      dateFormat: ['YYYY-MM-DD'],
    });

  let fileClerkFn = organizeByDate;
  if (byAlphabetical) fileClerkFn = organizeByAlphabetical;
  if (byExtension) fileClerkFn = organizeByExtension;
  if (byCustom) fileClerkFn = organizeByExtension;
  if (byType) {
    fileClerkFn = organize;
  }
  return { options, fileClerkFn };
};

const parseConfig = (config = []) => {
  const configs = asArray(config);
  return configs.map((c, i) => {
    const {
      name = `MediaClerk Job ${i + 1}`,
      cronTime = '* * * * *',
      sourcePath,
      targetPath,
      extensions: customExtensions = [],
      fileType,
      options: userOptions = {},
    } = c;

    if (!sourcePath) throw new Error(`MediaClerk Config Instance (${name}) must define a 'sourcePath' property`);
    if (!targetPath) throw new Error(`MediaClerk Config Instance (${name}) must define a 'targetPath' property`);

    const extensions =
      (Array.isArray(fileType) ? fileType : [fileType]).reduce(
        (accu, tStr = '') => {
          if (tStr === 'image') return [...accu, ...imageExtensions];
          if (tStr === 'video') return [...accu, ...videoExtensions];
          return accu;
        },
        (Array.isArray(customExtensions) ? customExtensions : [customExtensions]),
      );

    const { options: jobOptions, fileClerkFn } = buildOptions(c);

    return {
      name,
      cronTime,
      sourcePath,
      targetPath,
      fileClerkFn,
      options: {
        extensions,
        ...userOptions,
        ...jobOptions,
      },
    };
  });
};

const getTime = () => moment().format('YYYY-MM-DD HH:mm:ss');
const getDuration = millis => moment.duration(millis).asSeconds();

const cronsFromConfig = (config, opts = {}) => {
  const configs = parseConfig(config);
  const jobs = configs.map(({
    name,
    cronTime,
    fileClerkFn,
    sourcePath,
    targetPath,
    options,
  }) => {
    // eslint-disable-next-line
    console.log(`[${getTime()}] Scheduled '${name}' [${sourcePath} -> ${targetPath}] - ${prettyCron(cronTime)}`);

    return cron(cronTime, async () => {
      const start = Date.now();
      // eslint-disable-next-line
      console.log(`[${getTime()}] Running '${name}' [${sourcePath} -> ${targetPath}]`);
      const fn = fileClerkFn;
      const result = await fn(sourcePath, targetPath, options);
      const report = result.reduce((acc, { size, success, targetExists }) => Object.assign(acc, {
        size: acc.size + size,
        success: acc.success + (success ? 1 : 0),
        error: acc.error + (success ? 0 : 1),
        targetExists: acc.targetExists + targetExists,
      }), {
        size: 0,
        success: 0,
        error: 0,
        targetExists: 0,
      });

      const message = `[${getTime()}] Finished '${name}' [${sourcePath} -> ${targetPath}]
    duration ${getDuration(Date.now() - start)} seconds
   processed ${result.length} files (${prettyBytes(report.size)})
             ${report.success} success / ${report.error} errors
             ${report.targetExists} target exists`;
      // eslint-disable-next-line
      if (!isEmpty(process.env.LOG_PATH)) {
        fs.writeFileSync(`${process.env.LOG_PATH}/${name}-${start}.json`, `${message}\n${JSON.stringify(result, null, 2)}`);
      }
      return result;
    }, null, opts);
  });
  return jobs;
};

const loadConfigFromPath = (path) => {
  try {
    const config = require(path); // eslint-disable-line
    return config;
  } catch (err) {
    try {
      const config = require(`${path}/mediaclerk.json`); // eslint-disable-line
      return config;
    } catch (e) {
      throw new Error(`No mediaclerk.json found @ ${path}: ${err}`);
    }
  }
};

module.exports = {
  parseConfig,
  cronsFromConfig,
  loadConfigFromPath,
};
