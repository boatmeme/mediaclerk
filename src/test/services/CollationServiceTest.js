require('should');
const FileService = require('../../lib/services/FileService');
const CollationService = require('../../lib/services/CollationService');

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
        t.should.have.property('path').is.a.String().eql(`${targetDir}/${extension}/${filename}`);
      });
    });
  });

  describe('collate', () => {
    const srcDir = `${home}/sort`;
    const targetDir = `${home}/collated`;

    beforeEach(async () => {
      await FileService.createFile(`${srcDir}/01.mp4`);
      await FileService.createFile(`${srcDir}/02.png`);
      await FileService.createFile(`${srcDir}/03/04.png`);
      await FileService.createFile(`${srcDir}/03/sub/another.mp4`);
      await FileService.createDirectory(`${srcDir}/03/sub/donotfind.dir`);
      await FileService.createFile(`${srcDir}/05/06/a.rose.by.any.other.name.png`);
      await FileService.createFile(`${srcDir}/05/06/no_extension`);
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

    it('should move directories by default', async () => {
      const files = await CollationService.collate(`${srcDir}/05/06`, targetDir);
      files.should.be.an.Array().of.length(4);
      const remainingDirs = await FileService.listDirectoriesRecursive(`${srcDir}/05`);
      remainingDirs.should.be.an.Array().of.length(4);
      const remainingFiles = await FileService.listFilesRecursive(`${srcDir}/05`);
      remainingFiles.should.be.an.Array().of.length(1);
    });

    it('should move directories but not overwrite, and rename by default', async () => {
      await FileService.createFile(`${targetDir}/07.png`);
      await FileService.createFile(`${srcDir}/05/06/08.png`);
      await FileService.createFile(`${targetDir}/a.rose.by.any.other.name.png`);
      await FileService.createFile(`${targetDir}/no_extension`);

      const files = await CollationService.collate(`${srcDir}/05/06`, targetDir);
      files.should.be.an.Array().of.length(5);

      files.forEach((f) => {
        f.should.be.an.Object().has.property('success').eql(true);
        f.should.be.an.Object().not.has.property('error');
      });

      const remainingDirs = await FileService.listDirectoriesRecursive(`${srcDir}/05`);
      remainingDirs.should.be.an.Array().of.length(4);
      const remainingFiles = await FileService.listFilesRecursive(`${srcDir}/05`);
      remainingFiles.should.be.an.Array().of.length(1);
    });

    it('should move directories but not overwrite, and fail if rename disabled', async () => {
      await FileService.createFile(`${targetDir}/07.png`);
      await FileService.createFile(`${srcDir}/05/06/08.png`);
      await FileService.createFile(`${targetDir}/a.rose.by.any.other.name.png`);
      await FileService.createFile(`${targetDir}/no_extension`);

      const opts = {
        rename: false,
      };

      const files = await CollationService.collate(`${srcDir}/05/06`, targetDir, opts);
      files.should.be.an.Array().of.length(5);

      files[1].should.be.an.Object().has.property('success').eql(false);
      files[1].should.be.an.Object().has.property('error').of.type('string');
      files[3].should.be.an.Object().has.property('success').eql(false);
      files[3].should.be.an.Object().has.property('error').of.type('string');
      files[4].should.be.an.Object().has.property('success').eql(false);
      files[4].should.be.an.Object().has.property('error').of.type('string');

      const remainingDirs = await FileService.listDirectoriesRecursive(`${srcDir}/05`);
      remainingDirs.should.be.an.Array().of.length(4);
      const remainingFiles = await FileService.listFilesRecursive(`${srcDir}/05`);
      remainingFiles.should.be.an.Array().of.length(4);
    });

    it('should move directories and, optionally, overwrite', async () => {
      await FileService.createFile(`${targetDir}/07.png`);
      await FileService.createFile(`${srcDir}/05/06/08.png`);

      const opts = {
        overwrite: true,
      };

      const files = await CollationService.collate(`${srcDir}/05/06`, targetDir, opts);
      files.should.be.an.Array().of.length(5);

      files[1].should.be.an.Object().has.property('success').eql(true);
      files[1].should.be.an.Object().not.has.property('error');

      const remainingDirs = await FileService.listDirectoriesRecursive(`${srcDir}/05`);
      remainingDirs.should.be.an.Array().of.length(4);
      const remainingFiles = await FileService.listFilesRecursive(`${srcDir}/05`);
      remainingFiles.should.be.an.Array().of.length(1);
    });

    it('should move and clean directories recursively (but not the source directory, or directories that were untouched)', async () => {
      const opts = { recursive: true };
      const files = await CollationService.collate(`${srcDir}/05`, targetDir, opts);
      files.should.be.an.Array().of.length(5);
      const remainingDirs = await FileService.listDirectoriesRecursive(`${srcDir}/05`);
      remainingDirs.should.be.an.Array().of.length(2);
      const remainingFiles = await FileService.listFilesRecursive(`${srcDir}/05`);
      remainingFiles.should.be.an.Array().of.length(0);
      const newFiles = await FileService.listFilesRecursive(`${targetDir}`);
      newFiles.should.be.an.Array().of.length(5);
    });

    it('should move and NOT clean directories', async () => {
      const opts = { recursive: true, cleanDirs: false };
      const files = await CollationService.collate(`${srcDir}/05`, targetDir, opts);
      files.should.be.an.Array().of.length(5);
      const remainingDirs = await FileService.listDirectoriesRecursive(`${srcDir}/05`);
      remainingDirs.should.be.an.Array().of.length(4);
      const remainingFiles = await FileService.listFilesRecursive(`${srcDir}/05`);
      remainingFiles.should.be.an.Array().of.length(0);
      const newFiles = await FileService.listFilesRecursive(`${targetDir}`);
      newFiles.should.be.an.Array().of.length(5);
    });

    it('should copy and NOT clean directories', async () => {
      const opts = { copy: true, recursive: true, cleanDirs: true };
      const files = await CollationService.collate(`${srcDir}/05`, targetDir, opts);
      files.should.be.an.Array().of.length(5);
      const remainingDirs = await FileService.listDirectoriesRecursive(`${srcDir}/05`);
      remainingDirs.should.be.an.Array().of.length(4);
      const remainingFiles = await FileService.listFilesRecursive(`${srcDir}/05`);
      remainingFiles.should.be.an.Array().of.length(5);
      const newFiles = await FileService.listFilesRecursive(`${targetDir}`);
      newFiles.should.be.an.Array().of.length(5);
    });

    it('should collate with custom filters', async () => {
      const opts = {
        recursive: true,
        cleanDirs: true,
        sourceFilter: ({ extension }) => extension === 'arf',
      };
      const files = await CollationService.collate(`${srcDir}`, targetDir, opts);
      files.should.be.an.Array().of.length(3);
      const remainingDirs = await FileService.listDirectoriesRecursive(`${srcDir}`);
      remainingDirs.should.be.an.Array().of.length(8);
      const remainingFiles = await FileService.listFilesRecursive(`${srcDir}`);
      remainingFiles.should.be.an.Array().of.length(9);
      const newDirs = await FileService.listDirectoriesRecursive(`${targetDir}`);
      newDirs.should.be.an.Array().of.length(1);
      const newFiles = await FileService.listFilesRecursive(`${targetDir}`);
      newFiles.should.be.an.Array().of.length(3);
    });

    it('should collate with custom collation function', async () => {
      const opts = {
        recursive: true,
        cleanDirs: true,
        sourceFilter: ({ extension }) => extension === 'arf',
        collateFn: ({ name, filename }) => `${name}/${filename}`,
      };
      const files = await CollationService.collate(`${srcDir}`, targetDir, opts);
      files.should.be.an.Array().of.length(3);
      const remainingDirs = await FileService.listDirectoriesRecursive(`${srcDir}`);
      remainingDirs.should.be.an.Array().of.length(8);
      const remainingFiles = await FileService.listFilesRecursive(`${srcDir}`);
      remainingFiles.should.be.an.Array().of.length(9);
      const newDirs = await FileService.listDirectoriesRecursive(`${targetDir}`);
      newDirs.should.be.an.Array().of.length(3);
      const newFiles = await FileService.listFilesRecursive(`${targetDir}`);
      newFiles.should.be.an.Array().of.length(3);
    });

    it('should simulate collation w/dry run param', async () => {
      await FileService.createDirectory(targetDir);
      const opts = { recursive: true, cleanDirs: true, dryRun: true };
      const files = await CollationService.collate(`${srcDir}/05`, targetDir, opts);
      files.should.be.an.Array().of.length(5);
      const remainingDirs = await FileService.listDirectoriesRecursive(`${srcDir}/05`);
      remainingDirs.should.be.an.Array().of.length(4);
      const remainingFiles = await FileService.listFilesRecursive(`${srcDir}/05`);
      remainingFiles.should.be.an.Array().of.length(5);
      const newFiles = await FileService.listFilesRecursive(`${targetDir}`);
      newFiles.should.be.an.Array().of.length(0);
    });
    /*
    it.only('should simulate collation w/dry run param', async () => {
      const opts = {
        recursive: true,
        cleanDirs: true,
        dryRun: true,
        sourceFilter: ({ extension }) => extension === 'jpg',
        collateFn: ({ filename }) => `${filename}`,
      };
      const results = await CollationService.collate('/mnt/g/Pictures/INCOMING', targetDir, opts);
      console.log(results);
    }).timeout(400000);
    */
  });
});
