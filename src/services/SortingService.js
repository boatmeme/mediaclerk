const File = require('./FileService');

const defaultTargetPathGenerator = (file, sourcePath) => {
  const { path = '' } = file;
  const regex = new RegExp(`${sourcePath}/?`);
  const pathDiff = path.replace(regex, '');
  return pathDiff;
};

const defaultSourceFilter = () => true;

const separatorRegex = /^\//;

const buildTargetPath = (generatorFn, file, sourcePath, targetPath, opts) => {
  const generatedPath = generatorFn.call(this, file, sourcePath, targetPath, opts);
  return `${targetPath}/${generatedPath.replace(separatorRegex, '')}`;
};

exports.getCopyPairs = async (sourcePath, targetPath, opts = {}) => {
  const {
    sourceFilter = defaultSourceFilter,
    targetPathGenerator = defaultTargetPathGenerator,
    recursive = false,
  } = opts;
  const files = (await File.listFiles(sourcePath, { recursive }))
    .filter(sourceFilter);

  return files.map(f => [f, buildTargetPath(targetPathGenerator, f, sourcePath, targetPath, opts)]);
};
