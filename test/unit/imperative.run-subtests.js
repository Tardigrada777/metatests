'use strict';

const assert = require('assert');
const { ImperativeTest } = require('../../metatests');
const test = new ImperativeTest('', null, { timeout: 1000 });
const st1 = test.testSync('successful subtest', t => t.pass(), {
  timeout: 1000,
});
const st2 = test.testSync('failing subtest', t => t.fail(), { timeout: 1000 });
test.on('done', () => {
  const subtest1res = {
    type: 'subtest',
    test: st1,
    message: 'successful subtest',
  };
  Object.defineProperty(subtest1res, 'success', {
    get: () => st1.success,
  });
  const subtest2res = {
    type: 'subtest',
    test: st2,
    message: 'failing subtest',
  };
  Object.defineProperty(subtest2res, 'success', {
    get: () => st2.success,
  });
  assert.deepStrictEqual(test.results, [subtest1res, subtest2res]);
});

let error;
const erroringTest = new ImperativeTest('', null, { timeout: 1000 });
const st3 = erroringTest.testSync('throwing test', () => {
  throw new Error();
});
st3.on('error', (test, err) => {
  error = err;
});
st3.end();
erroringTest.on('done', () => {
  const res1 = {
    type: 'subtest',
    test: st3,
    message: 'throwing test',
  };
  Object.defineProperty(res1, 'success', {
    get: () => st3.success,
  });
  assert.deepStrictEqual(erroringTest.results, [
    res1,
    {
      test: st3,
      message: `Error in subtest '${st3.caption}': ${error}`,
      stack: error.stack,
      type: 'subtest',
      success: false,
    },
  ]);
});
