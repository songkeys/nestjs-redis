import * as allExports from '.';

test('there should be 5 exports', () => {
  expect(Object.keys(allExports)).toHaveLength(5);
});

test('each of exports should be defined', () => {
  Object.values(allExports).forEach(value => expect(value).not.toBeNil());
});
