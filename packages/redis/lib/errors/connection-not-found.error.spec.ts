import { ConnectionNotFoundError } from './connection-not-found.error';

test('identifies the missing connection', () => {
  const error = new ConnectionNotFoundError('name');
  expect(error.name).toBe('ConnectionNotFoundError');
  expect(error.message).toBe('Connection "name" was not found.');
});
