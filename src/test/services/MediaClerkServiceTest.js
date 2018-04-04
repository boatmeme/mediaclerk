require('should');
const FileService = require('../../services/FileService');
const MediaClerk = require('../../services/MediaClerkService');

describe('MediaClerkService', () => {
  const home = './test/fixtures';

  before(async () => {
    await FileService.createDirectory(home);
  });
  after(async () => {
    await FileService.deleteDirectory(home);
  });

  describe('organize', () => {
    const srcDir = `${home}/Pictures/INCOMING`;
    const targetDir = `${home}/PictureDestination`;

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
      await FileService.createFile(`${srcDir}/png/1.arf`);
      await FileService.createFile(`${srcDir}/png/2.arf`);
      await FileService.createFile(`${srcDir}/png/3.arf`);
    });
    afterEach(async () => {
      await FileService.deleteDirectory(srcDir);
      await FileService.deleteDirectory(targetDir);
    });

    it('should organize with list of extension filters', async () => {
      const opts = {
        extensions: ['jpg', 'png'],
      };
      const files = await MediaClerk.organize(srcDir, targetDir, opts);
      files.should.be.an.Array().of.length(4);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(8);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(6);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(3);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(4);
    });

    it('should simulate organize w/dry run param', async () => {
      await FileService.createDirectory(targetDir);
      const opts = {
        extensions: ['jpg', 'png'],
        dryRun: true,
      };

      const files = await MediaClerk.organize(srcDir, targetDir, opts);
      files.should.be.an.Array().of.length(4);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(9);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(10);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(0);
    });
  });

  describe('organizeByDate', () => {
    const srcDir = `${home}/Pictures/INCOMING`;
    const targetDir = `${home}/PictureDestination`;

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
      await FileService.createFile(`${srcDir}/png/1.arf`);
      await FileService.createFile(`${srcDir}/png/2.arf`);
      await FileService.createFile(`${srcDir}/png/3.arf`);
    });
    afterEach(async () => {
      await FileService.deleteDirectory(srcDir);
      await FileService.deleteDirectory(targetDir);
    });

    it('should organize with list by creation date (default format)', async () => {
      const opts = {
        extensions: ['jpg', 'png'],
      };
      const files = await MediaClerk.organizeByDate(srcDir, targetDir, opts);
      files.should.be.an.Array().of.length(4);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(8);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(6);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(1);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(4);
    });

    it('should organize with list by creation date (default formats)', async () => {
      const opts = {
        extensions: ['jpg', 'png'],
        dateFormat: ['YYYY', 'YYYY-MM', 'YYYY-MM-DD'],
      };
      const files = await MediaClerk.organizeByDate(srcDir, targetDir, opts);
      console.log(files);
      files.should.be.an.Array().of.length(4);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(8);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(6);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(3);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(4);
    });
  });
});
