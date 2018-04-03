require('should');
const FileService = require('../../services/FileService');
const SortingService = require('../../services/SortingService');

describe('SortingService', () => {
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
      const files = await SortingService.getCopyPairs(`${srcDir}/03`, targetDir);
      files.should.be.an.Array().of.length(1);
      files[0].should.be.an.Array().of.length(2);
    });

    it('should get Source / Target pairs for all files in a directory (recursive)', async () => {
      const opts = { recursive: true };
      const files = await SortingService.getCopyPairs(`${srcDir}`, targetDir, opts);
      files.should.be.an.Array().of.length(6);
      files.forEach(f => f.should.be.an.Array().of.length(2));
    });

    it('should get Source / Target pairs for all files in a directory (w/Source Filter)', async () => {
      const opts = {
        recursive: true,
        sourceFilter: ({ extension }) => extension === 'png',
      };
      const files = await SortingService.getCopyPairs(`${srcDir}`, targetDir, opts);
      files.should.be.an.Array().of.length(3);
      files.forEach(f => f.should.be.an.Array().of.length(2));
    });

    it('should get Source / Target pairs for all files in a directory (w/Custom Target Path Generator)', async () => {
      const opts = {
        recursive: true,
        targetPathGenerator: f => `${f.extension}/${f.filename}`,
      };
      const files = await SortingService.getCopyPairs(`${srcDir}`, targetDir, opts);

      files.should.be.an.Array().of.length(6);
      files.forEach(f => f.should.be.an.Array().of.length(2));
      files.forEach(([{ extension, filename }, t]) => {
        t.should.be.a.String().eql(`${targetDir}/${extension}/${filename}`);
      });
    });
  });
});
