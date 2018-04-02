require('should');
const AsyncUtils = require('../../util/AsyncUtils');

describe('AsyncUtils', () => {
  describe('filterAsync', () => {
    it('should filter array of values based on an async function', async () => {
      const arr = [1, 2, 3];
      const fn = num => Promise.resolve(num % 2 === 0);
      const results = await AsyncUtils.filterAsync(arr, fn);
      results.should.be.an.Array().of.length(1);
      results[0].should.eql(2);
    });
    it('should filter array of values based on an async function, invert the filter', async () => {
      const arr = [1, 2, 3];
      const fn = num => Promise.resolve(num % 2 === 0);
      const results = await AsyncUtils.filterAsync(arr, fn, v => !v);
      results.should.be.an.Array().of.length(2);
      results[0].should.eql(1);
      results[1].should.eql(3);
    });
    it('should filter array of promises based on an async function', async () => {
      const arr = [Promise.resolve(1), Promise.resolve(2), Promise.resolve(3)];
      const fn = num => Promise.resolve(num % 2 === 0);
      const results = await AsyncUtils.filterAsync(arr, fn);
      results.should.be.an.Array().of.length(1);
      results[0].should.eql(2);
    });
  });
});
