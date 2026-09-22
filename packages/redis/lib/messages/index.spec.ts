import { generateReadyMessage, generateErrorMessage } from '.';

describe('generateReadyMessage', () => {
  test('should return a string', () => {
    expect(generateReadyMessage('name')).toBe(`name: the connection was successfully established`);
  });
});

describe('generateErrorMessage', () => {
  test('should return a string', () => {
    expect(generateErrorMessage('name', 'message')).toBe(`name: message`);
  });
});
