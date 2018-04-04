const { collate } = require('./CollationService');
const { isEmpty, isArray, compact } = require('../util/ArrayUtils');
const { format: dateStr } = require('../util/TimeUtils');

exports.organize = async (sourcePath, targetPath, opts = {}) => {
  const defaults = {
    recursive: true,
    cleanDirs: true,
  };

  const extensions = opts.extensions || [];
  const sourceFilter = isEmpty(extensions)
    ? opts.sourceFilter
    : file => extensions.includes(file.extension);

  const options = Object.assign({}, defaults, opts, { sourceFilter });

  const results = await collate(sourcePath, targetPath, options);
  return results;
};

exports.organizeByDate = (sourcePath, targetPath, opts = {}) => {
  const {
    dateFormat = ['YYYY-MM-DD'],
    dateProperty = 'ctime',
  } = opts;

  const fmtStrArr = compact(isArray(dateFormat) ? dateFormat : [dateFormat]);

  const collateFn = (f) => {
    const dateVal = f[dateProperty];
    return [
      ...fmtStrArr.map(fmtStr => `${dateStr(dateVal, fmtStr)}`),
      f.filename,
    ].join('/');
  };
  const options = Object.assign({}, opts, { collateFn });
  return exports.organize(sourcePath, targetPath, options);
};
