import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheckResult } from '@nestjs/terminus';
import { RedisHealthIndicator } from '@health/.';
import { ClusterService } from '@/.';

@Controller('health')
export class HealthController {
  constructor(
    private readonly connections: ClusterService,
    private readonly health: HealthCheckService,
    private readonly redis: RedisHealthIndicator
  ) {}

  @Get()
  async healthCheck(): Promise<HealthCheckResult> {
    await this.connections.getOrThrow().ping();
    await this.connections.getOrThrow('client1').ping();
    return await this.health.check([
      () => this.redis.checkHealth('default', { client: this.connections.getOrThrow(), type: 'cluster' }),
      () => this.redis.checkHealth('client1', { client: this.connections.getOrThrow('client1'), type: 'cluster' })
    ]);
  }
}
