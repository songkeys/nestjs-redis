import { Controller, Get } from '@nestjs/common';
import { RedisService } from '@/.';

@Controller('service')
export class ServiceController {
  constructor(private readonly manager: RedisService) {}

  @Get()
  async ping() {
    const resp_0 = await this.manager.getOrThrow().ping();
    const resp_1 = await this.manager.getOrThrow('client1').ping();
    return [resp_0, resp_1];
  }
}
