require('should');
const FileService = require('../../services/FileService');
const FileClerk = require('../../services/FileClerkService');

describe('FileClerkService', () => {
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
      const files = await FileClerk.organize(srcDir, targetDir, opts);
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

      const files = await FileClerk.organize(srcDir, targetDir, opts);
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

    it('should organize by creation date (default format)', async () => {
      const opts = {
        extensions: ['jpg', 'png'],
      };
      const files = await FileClerk.organizeByDate(srcDir, targetDir, opts);
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

    it('should organize by creation date (custom formats)', async () => {
      const opts = {
        extensions: ['jpg', 'png'],
        dateFormat: ['YYYY', 'YYYY-MM', 'YYYY-MM-DD'],
      };
      const files = await FileClerk.organizeByDate(srcDir, targetDir, opts);
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

  describe('organizeByExtension', () => {
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
      await FileService.createFile(`${srcDir}/png/1`);
      await FileService.createFile(`${srcDir}/png/1.arf`);
      await FileService.createFile(`${srcDir}/png/2.arf`);
      await FileService.createFile(`${srcDir}/png/3.arf`);
    });
    afterEach(async () => {
      await FileService.deleteDirectory(srcDir);
      await FileService.deleteDirectory(targetDir);
    });

    it('should organize by file extension', async () => {
      const opts = {
        extensions: ['jpg', 'png', ''],
      };
      const files = await FileClerk.organizeByExtension(srcDir, targetDir, opts);
      files.should.be.an.Array().of.length(5);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(8);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(6);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(3);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(5);
    });
  });

  describe('organizeByAlphabetical', () => {
    const srcDir = `${home}/Pictures/INCOMING`;
    const targetDir = `${home}/PictureDestination`;

    beforeEach(async () => {
      await FileService.createFile(`${srcDir}/1.mp4`);
      await FileService.createFile(`${srcDir}/02.png`);
      await FileService.createFile(`${srcDir}/03/~&.png`);
      await FileService.createFile(`${srcDir}/03/sub/another.mp4`);
      await FileService.createDirectory(`${srcDir}/03/sub/donotfind.dir`);
      await FileService.createFile(`${srcDir}/05/06/a.png`);
      await FileService.createFile(`${srcDir}/05/06/!#b.jpg`);
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

    it('should organize by alphabetical', async () => {
      const opts = {
        extensions: ['jpg', 'png', 'mp4'],
      };
      const files = await FileClerk.organizeByAlphabetical(srcDir, targetDir, opts);
      files.should.be.an.Array().of.length(7);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(4);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(3);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(4);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(7);
    });

    it('should organize by alphabetical w/Custom Symbol and Case', async () => {
      const opts = {
        extensions: ['jpg', 'png', 'mp4'],
        upperCase: true,
        symbolDir: '#',
      };
      const files = await FileClerk.organizeByAlphabetical(srcDir, targetDir, opts);
      files.should.be.an.Array().of.length(7);
      const remainingDirs = await FileService.listDirectoriesRecursive(srcDir);
      remainingDirs.should.be.an.Array().of.length(4);
      const remainingFiles = await FileService.listFilesRecursive(srcDir);
      remainingFiles.should.be.an.Array().of.length(3);
      const newDirs = await FileService.listDirectoriesRecursive(targetDir);
      newDirs.should.be.an.Array().of.length(5);
      const newFiles = await FileService.listFilesRecursive(targetDir);
      newFiles.should.be.an.Array().of.length(7);
    });
  });
});
