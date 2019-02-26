const {sum,mul,formato} = require('./funtiontest.js');

test('adds 1 + 2 to equal 3', () => {
  expect(sum(1, 2)).toBe(3);
});

test('adds 1 + 2 to equal 3', () => {
  expect(mul(3, 3)).toBe(9);
});

test('string', () => {
  var str=formato('a','b');
  expect(str).toEqual(["a","b"]);
});
