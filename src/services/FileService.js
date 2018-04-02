const {
  lstat,
  ensureDir,
  remove,
  readdir,
  ensureFile,
  move,
} = require('fs-extra');
const { filterAsync } = require('../util/AsyncUtils');
const { groupBy } = require('../util/ArrayUtils');

const separatorRegex = /[/|\\]/;
const extensionRegex = /[.]/;

const isDirectory = async (path) => {
  const stat = await lstat(path);
  return stat.isDirectory();
};

exports.stat = async (path) => {
  const stat = await lstat(path);
  const isDirectory = stat.isDirectory();
  const { ctime, mtime, size } = stat;
  const [filename, parentDir] = path.split(separatorRegex).reverse();
  const [name, extension = ''] = filename.split(extensionRegex);
  return {
    path,
    filename,
    name,
    extension: extension.toLowerCase(),
    parentDir,
    ctime,
    mtime,
    size,
    isDirectory,
  };
};

exports.move = async (srcPath, targetPath) => {
  return move(srcPath, targetPath);
}

exports.listDirectories = async (path, recursive = false) => {
  const filesAndDirs = await exports.listFilesAndDirectories(path, recursive);
  const { true: directories = []} = groupBy(filesAndDirs, 'isDirectory');
  return directories;
}

exports.createFile = path => ensureFile(path);
exports.createDirectory = path => ensureDir(path);
exports.deleteDirectory = path => remove(path);

exports.listFilesAndDirectories = async (path, recursive = false, skipCheck = false) => {
  if (!skipCheck) {
    const bIsDirectory = await isDirectory(path);
    if (!bIsDirectory) throw new Error(`${path} is not a directory`);
  }

  const contents = await readdir(path);
  const filesAndDirs = await Promise.all(contents.map(name => exports.stat(`${path}/${name}`)));
  console.log(path, filesAndDirs);
  if (!recursive) return filesAndDirs;
  const directories = filesAndDirs.filter(({ isDirectory }) => isDirectory);
  const children = await Promise.all(directories.map(({ path }) => exports.listFilesAndDirectories(path, recursive, true)));
  console.log(path, children)
  return [...filesAndDirs, ...children];
}

exports.listFiles = async (path, recursive = false) => {
  const filesAndDirs = await exports.listFilesAndDirectories(path, recursive);
  const { false: files = []} = groupBy(filesAndDirs, 'isDirectory');
  return files;
}
