require('should');
const MediaClerk = require('../../lib/services/MediaClerkService');

describe('MediaClerkService', () => {
  describe('parseConfig', () => {
    it('should parse a MediaClerk configuration', () => {
      const config = {
        name: 'Test Job',
        cronTime: '* * * * *',
        sourcePath: '/Volumes/FamilyArchives/Pictures/INCOMING',
        targetPath: '/Volumes/FamilyArchives/Pictures',
        byDate: {
          dateFormat: ['YYYY', 'YYYY-MM-DD'],
        },
        extensions: [],
        fileType: 'video',
      };

      const jobConfig = MediaClerk.parseConfig(config);
      jobConfig.should.be.an.Array().of.length(1);
    });

    it('should parse a MediaClerk configuration', () => {
      const config = {
        name: 'Test Job',
        cronTime: '* * * * *',
        sourcePath: '/Volumes/FamilyArchives/Pictures/INCOMING',
        targetPath: '/Volumes/FamilyArchives/Pictures',
        byExtension: true,
        extensions: [],
        fileType: 'video',
      };

      const jobConfig = MediaClerk.parseConfig(config);
      jobConfig.should.be.an.Array().of.length(1);
    });
  });
});
