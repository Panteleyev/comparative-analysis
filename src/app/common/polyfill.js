// polyfill
Math.sign = Math.sign || function(x) {
  const _x = +x;

  if (_x === 0 || isNaN(_x)) {
    return _x;
  }

  return _x > 0 ? 1 : -1;
};