import * as allExports from '.';

test('there should be 1 exports', () => {
  expect(Object.keys(allExports)).toHaveLength(1);
});

test('each of exports should be defined', () => {
  Object.values(allExports).forEach(value => expect(value).not.toBeNil());
});
