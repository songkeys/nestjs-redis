import { Module } from '@nestjs/common';
import { ClusterModule, ClusterModuleOptions } from '@/.';
import { ServiceController } from './controllers/service.controller';

@Module({
  imports: [
    ClusterModule.forRootAsync({
      useFactory(): ClusterModuleOptions {
        return {
          config: [
            {
              nodes: [{ host: '127.0.0.1', port: 16380 }],
              redisOptions: { password: 'cluster1' }
            },
            {
              namespace: 'client1',
              nodes: [{ host: '127.0.0.1', port: 16480 }],
              redisOptions: { password: 'cluster2' }
            }
          ]
        };
      }
    })
  ],
  controllers: [ServiceController]
})
export class AppModule {}
