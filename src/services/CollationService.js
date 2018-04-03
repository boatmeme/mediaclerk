const File = require('./FileService');
const { mapSequence, orderBy } = require('../util/ArrayUtils');

const defaultCollateFn = (file, sourcePath) => {
  const { path = '' } = file;
  const regex = new RegExp(`${sourcePath}/?`);
  const pathDiff = path.replace(regex, '');
  return pathDiff;
};

const defaultSourceFilter = () => true;

const leadingSeparatorRegex = /^\//;
const separatorRegex = /\//;

const buildTargetPath = (collateFn, file, sourcePath, targetPath, opts) => {
  const generatedPath = collateFn.call(this, file, sourcePath, targetPath, opts);
  return `${targetPath}/${generatedPath.replace(leadingSeparatorRegex, '')}`;
};

const sortByPathDepth = arr => orderBy(arr, [o => o.path.split(separatorRegex).length, 'path'], ['desc', 'asc']);

exports.getCopyPairs = async (sourcePath, targetPath, opts = {}) => {
  const {
    sourceFilter = defaultSourceFilter,
    collateFn = defaultCollateFn,
    recursive = false,
  } = opts;
  const files = (await File.listFiles(sourcePath, { recursive }))
    .filter(sourceFilter);

  return sortByPathDepth(files)
    .map(f => [f, buildTargetPath(collateFn, f, sourcePath, targetPath, opts)]);
};

exports.collate = async (sourcePath, targetPath, opts = {}) => {
  const defaults = { copy: false, cleanDirs: true, dryRun: false };
  const options = Object.assign({}, defaults, opts);

  const pairs = await exports.getCopyPairs(sourcePath, targetPath, options);
  const results = await mapSequence(pairs, async ([srcFile, target]) => {
    if (options.dryRun) {
      return { src: srcFile.path, target, op: (options.copy ? 'copy' : 'move') };
    }
    const fileOp = options.copy ? File.copy : File.move;
    await fileOp.call(this, srcFile.path, target);

    if (!options.copy && options.cleanDirs) {
      const parent = srcFile.parentDir;
      // We're only going to recursively delete subdirectories, not the top-level source directory
      if (parent !== sourcePath) {
        const otherFiles = await File.listFilesRecursive(parent);
        if (otherFiles.length === 0) await File.deleteDirectory(parent);
      }
    }
    return { src: srcFile.path, target, op: (options.copy ? 'copy' : 'move') };
  });
  return results;
};
