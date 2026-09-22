import { Cluster } from 'ioredis';
import { createClient } from './cluster.utils';
import { NAMESPACE_KEY } from '../cluster.constants';
import { logger } from '../cluster-logger';

jest.mock('../cluster-logger', () => ({ logger: { log: jest.fn(), error: jest.fn() } }));
const clients: Cluster[] = [];
afterEach(() => {
  clients.forEach(client => client.disconnect());
  clients.length = 0;
});

test('creates a cluster connection with its namespace and callback', () => {
  const created = jest.fn();
  const client = createClient({ nodes: [], namespace: 'cache', lazyConnect: true, onClientCreated: created }, {});
  clients.push(client);
  expect(client).toBeInstanceOf(Cluster);
  expect(Reflect.get(client, NAMESPACE_KEY)).toBe('cache');
  expect(created).toHaveBeenCalledWith(client);
});

test('logs ready and error events with the namespace', () => {
  const client = createClient({ nodes: [], namespace: 'cache', lazyConnect: true }, { readyLog: true, errorLog: true });
  clients.push(client);
  client.emit('ready');
  const error = new Error('connection failed');
  client.emit('error', error);
  expect(logger.log).toHaveBeenCalledWith('cache: the connection was successfully established');
  expect(logger.error).toHaveBeenCalledWith('cache: connection failed', error.stack);
});
