/**
 * Get object by path
 *
 * @param {any} obj
 * @param {string} path
 * @param {any} defaultValue
 */
export const get = (obj, path, defaultValue) => {
  const result = String.prototype.split.call(path, /[,[\].]+?/)
    .filter(Boolean)
    .reduce((res, key) => (res !== null && res !== undefined) ? res[key] : res, obj);
  return (result === undefined || result === obj) ? defaultValue : result;
};
