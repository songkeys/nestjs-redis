import { TerminusModule } from '@nestjs/terminus';
import { Module } from '@nestjs/common';
import { RedisHealthIndicator } from './indicators/redis.health';

/**
 * @public
 */
@Module({
  imports: [TerminusModule],
  providers: [RedisHealthIndicator],
  exports: [RedisHealthIndicator]
})
export class RedisHealthModule {}
