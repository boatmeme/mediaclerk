
exports.filterAsync = async (arr, asyncFn, filterFn = v => v === true) => {
  const all = await Promise.all(arr);
  const filters = await Promise.all(all.map(asyncFn));
  return all.filter((o, index) => filterFn.call(this, filters[index]));
};
