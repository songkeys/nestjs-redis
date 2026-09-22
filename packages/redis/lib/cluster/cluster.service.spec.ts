import { Test, TestingModule } from '@nestjs/testing';
import { Cluster } from 'ioredis';
import { ClusterService } from './cluster.service';
import { ClusterClients } from './interfaces';
import { CLUSTER_CLIENTS, DEFAULT_CLUSTER } from './cluster.constants';

jest.mock('ioredis', () => ({
  Cluster: jest.fn(() => ({}))
}));

describe('ClusterService', () => {
  let clients: ClusterClients;
  let manager: ClusterService;

  beforeEach(async () => {
    clients = new Map();
    clients.set(DEFAULT_CLUSTER, new Cluster([]));
    clients.set('client1', new Cluster([]));

    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: CLUSTER_CLIENTS, useValue: clients }, ClusterService]
    }).compile();

    manager = module.get<ClusterService>(ClusterService);
  });

  test('returns null for an unknown namespace', () => {
    expect(manager.getOrNil('missing')).toBeNull();
  });

  test('returns the same connection through getOrNil', () => {
    expect(manager.getOrNil('client1')).toBe(manager.getOrThrow('client1'));
  });

  test('should get a client with namespace', () => {
    const client = manager.getOrThrow('client1');
    expect(client).toBeDefined();
  });

  test('should get default client with namespace', () => {
    const client = manager.getOrThrow(DEFAULT_CLUSTER);
    expect(client).toBeDefined();
  });

  test('should get default client without namespace', () => {
    const client = manager.getOrThrow();
    expect(client).toBeDefined();
  });

  test('should throw an error when getting a client with an unknown namespace', () => {
    expect(() => manager.getOrThrow('')).toThrow();
  });
});
