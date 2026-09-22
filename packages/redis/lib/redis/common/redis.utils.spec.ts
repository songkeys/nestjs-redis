import { Redis } from 'ioredis';
import { create, removeListeners, readyCallback, errorCallback } from './redis.utils';
import { NAMESPACE_KEY } from '../redis.constants';

const clients: Redis[] = [];
afterEach(() => {
  clients.forEach(client => client.disconnect());
  clients.length = 0;
});

test('creates a connection from a URL with options and namespace', () => {
  const client = create({ url: 'redis://127.0.0.1:6380/4', namespace: 'cache', lazyConnect: true }, {});
  clients.push(client);
  expect(client.options.port).toBe(6380);
  expect(client.options.db).toBe(4);
  expect(Reflect.get(client, NAMESPACE_KEY)).toBe('cache');
});

test('creates a connection using a Unix socket', () => {
  const client = create({ path: '/tmp/redis.sock', lazyConnect: true }, {});
  clients.push(client);
  expect(client.options.path).toBe('/tmp/redis.sock');
});

test('accepts an existing connection and invokes creation hooks in order', () => {
  const client = new Redis({ lazyConnect: true });
  clients.push(client);
  const calls: string[] = [];
  const result = create(
    {
      provide: () => {
        calls.push('provide');
        return client;
      },
      created: connection => {
        expect(connection).toBe(client);
        calls.push('created');
      }
    },
    {
      beforeCreate: () => {
        calls.push('before');
      }
    }
  );
  expect(result).toBe(client);
  expect(calls).toEqual(['before', 'provide', 'created']);
});

test('removes only the module logging listeners', () => {
  const client = create({ lazyConnect: true }, { readyLog: true, errorLog: true });
  clients.push(client);
  const ownListener = jest.fn();
  client.on('ready', ownListener);
  expect(client.listeners('ready')).toContain(readyCallback);
  expect(client.listeners('error')).toContain(errorCallback);
  removeListeners(client);
  expect(client.listeners('ready')).toEqual([ownListener]);
  expect(client.listeners('error')).not.toContain(errorCallback);
});
