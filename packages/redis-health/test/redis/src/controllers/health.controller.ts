import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheckResult } from '@nestjs/terminus';
import { RedisHealthIndicator } from '@health/.';
import { RedisService } from '@/.';

@Controller('health')
export class HealthController {
  constructor(
    private readonly connections: RedisService,
    private readonly health: HealthCheckService,
    private readonly redis: RedisHealthIndicator
  ) {}

  @Get()
  async healthCheck(): Promise<HealthCheckResult> {
    return await this.health.check([
      () => this.redis.checkHealth('default', { client: this.connections.getOrThrow(), type: 'redis' }),
      () => this.redis.checkHealth('client1', { client: this.connections.getOrThrow('client1'), type: 'redis' })
    ]);
  }
}
