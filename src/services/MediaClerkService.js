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

exports.organizeByExtension = (sourcePath, targetPath, opts = {}) => {
  const {
    noExtensionDir = 'any',
  } = opts;

  const collateFn = ({ extension = noExtensionDir, filename }) =>
    (isEmpty(extension)
      ? `${noExtensionDir}/${filename}`
      : `${extension}/${filename}`);

  const options = Object.assign({}, opts, { collateFn });
  return exports.organize(sourcePath, targetPath, options);
};

const alphaNumRegex = /([0-9A-Za-z])/;
exports.organizeByAlphabetical = (sourcePath, targetPath, opts = {}) => {
  const {
    upperCase = false,
    symbolDir = '0',
  } = opts;

  const collateFn = ({ name, filename }) => {
    const matches = name.match(alphaNumRegex) || [];
    const [firstChar = symbolDir] = matches;
    const dirName = upperCase ? firstChar.toUpperCase() : firstChar.toLowerCase();
    return `/${dirName}/${filename}`;
  };

  const options = Object.assign({}, opts, { collateFn });
  return exports.organize(sourcePath, targetPath, options);
};
