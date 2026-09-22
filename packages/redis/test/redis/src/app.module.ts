import { Module } from '@nestjs/common';
import { RedisModule } from '@/.';
import { RedisConfigService } from './redis-config.service';
import { ServiceController } from './controllers/service.controller';

@Module({
  imports: [
    RedisModule.forRootAsync({
      useClass: RedisConfigService
    })
  ],
  controllers: [ServiceController]
})
export class AppModule {}
