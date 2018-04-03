require('should');
const FileService = require('../../services/FileService');
const CollationService = require('../../services/CollationService');

describe('CollationService', () => {
  const home = './test/fixtures';

  before(async () => {
    await FileService.createDirectory(home);
  });
  after(async () => {
    await FileService.deleteDirectory(home);
  });

  describe('getCopyPairs', () => {
    const srcDir = `${home}/synchronize`;
    const targetDir = `${home}/synchronize/target`;

    before(async () => {
      await FileService.createFile(`${srcDir}/01.mp4`);
      await FileService.createFile(`${srcDir}/02.png`);
      await FileService.createFile(`${srcDir}/03/04.png`);
      await FileService.createFile(`${srcDir}/03/sub/another.mp4`);
      await FileService.createDirectory(`${srcDir}/03/sub/donotfind.dir`);
      await FileService.createFile(`${srcDir}/05/06/07.png`);
      await FileService.createFile(`${srcDir}/05/06/07.jpg`);
      await FileService.createDirectory(`${srcDir}/05/08/09`);
    });
    after(async () => {
      await FileService.deleteDirectory(`${srcDir}`);
    });
    it('should get Source / Target pairs for all files in a directory', async () => {
      const files = await CollationService.getCopyPairs(`${srcDir}/03`, targetDir);
      files.should.be.an.Array().of.length(1);
      files[0].should.be.an.Array().of.length(2);
    });

    it('should get Source / Target pairs for all files in a directory (recursive)', async () => {
      const opts = { recursive: true };
      const files = await CollationService.getCopyPairs(`${srcDir}`, targetDir, opts);
      files.should.be.an.Array().of.length(6);
      files.forEach(f => f.should.be.an.Array().of.length(2));
    });

    it('should get Source / Target pairs for all files in a directory (w/Source Filter)', async () => {
      const opts = {
        recursive: true,
        sourceFilter: ({ extension }) => extension === 'png',
      };
      const files = await CollationService.getCopyPairs(`${srcDir}`, targetDir, opts);
      files.should.be.an.Array().of.length(3);
      files.forEach(f => f.should.be.an.Array().of.length(2));
    });

    it('should get Source / Target pairs for all files in a directory (w/Custom Target Path Generator)', async () => {
      const opts = {
        recursive: true,
        collateFn: f => `${f.extension}/${f.filename}`,
      };
      const files = await CollationService.getCopyPairs(`${srcDir}`, targetDir, opts);

      files.should.be.an.Array().of.length(6);
      files.forEach(f => f.should.be.an.Array().of.length(2));
      files.forEach(([{ extension, filename }, t]) => {
        t.should.be.a.String().eql(`${targetDir}/${extension}/${filename}`);
      });
    });
  });

  describe('collate', () => {
    const srcDir = `${home}/sort`;
    const targetDir = `${home}/file`;

    beforeEach(async () => {
      await FileService.createFile(`${srcDir}/01.mp4`);
      await FileService.createFile(`${srcDir}/02.png`);
      await FileService.createFile(`${srcDir}/03/04.png`);
      await FileService.createFile(`${srcDir}/03/sub/another.mp4`);
      await FileService.createDirectory(`${srcDir}/03/sub/donotfind.dir`);
      await FileService.createFile(`${srcDir}/05/06/07.png`);
      await FileService.createFile(`${srcDir}/05/06/07.jpg`);
      await FileService.createFile(`${srcDir}/05/07/10.mp4`);
      await FileService.createDirectory(`${srcDir}/05/08/09`);
    });
    afterEach(async () => {
      await FileService.deleteDirectory(srcDir);
      await FileService.deleteDirectory(targetDir);
    });

    it('should move directories by default', async () => {
      const files = await CollationService.collate(`${srcDir}/05/06`, targetDir);
      files.should.be.an.Array().of.length(2);
      const remainingDirs = await FileService.listDirectoriesRecursive(`${srcDir}/05`);
      remainingDirs.should.be.an.Array().of.length(4);
      const remainingFiles = await FileService.listFilesRecursive(`${srcDir}/05`);
      remainingFiles.should.be.an.Array().of.length(1);
    });

    it('should move and clean directories recursively (but not the source directory, or directories that were untouched)', async () => {
      const opts = { recursive: true };
      const files = await CollationService.collate(`${srcDir}/05`, targetDir, opts);
      files.should.be.an.Array().of.length(3);
      const remainingDirs = await FileService.listDirectoriesRecursive(`${srcDir}/05`);
      remainingDirs.should.be.an.Array().of.length(2);
      const remainingFiles = await FileService.listFilesRecursive(`${srcDir}/05`);
      remainingFiles.should.be.an.Array().of.length(0);
      const newFiles = await FileService.listFilesRecursive(`${targetDir}`);
      newFiles.should.be.an.Array().of.length(3);
    });

    it('should move and NOT clean directories', async () => {
      const opts = { recursive: true, cleanDirs: false };
      const files = await CollationService.collate(`${srcDir}/05`, targetDir, opts);
      files.should.be.an.Array().of.length(3);
      const remainingDirs = await FileService.listDirectoriesRecursive(`${srcDir}/05`);
      remainingDirs.should.be.an.Array().of.length(4);
      const remainingFiles = await FileService.listFilesRecursive(`${srcDir}/05`);
      remainingFiles.should.be.an.Array().of.length(0);
      const newFiles = await FileService.listFilesRecursive(`${targetDir}`);
      newFiles.should.be.an.Array().of.length(3);
    });

    it('should copy and NOT clean directories', async () => {
      const opts = { copy: true, recursive: true, cleanDirs: true };
      const files = await CollationService.collate(`${srcDir}/05`, targetDir, opts);
      files.should.be.an.Array().of.length(3);
      const remainingDirs = await FileService.listDirectoriesRecursive(`${srcDir}/05`);
      remainingDirs.should.be.an.Array().of.length(4);
      const remainingFiles = await FileService.listFilesRecursive(`${srcDir}/05`);
      remainingFiles.should.be.an.Array().of.length(3);
      const newFiles = await FileService.listFilesRecursive(`${targetDir}`);
      newFiles.should.be.an.Array().of.length(3);
    });
  });
});
