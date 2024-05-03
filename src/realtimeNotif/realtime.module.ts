import { Module } from '@nestjs/common';
import { SocketModule } from '@nestjs/websockets/socket-module';
import { RealTimeGateway } from './realtime.gateway';


@Module({
  imports: [SocketModule],
  providers: [RealTimeGateway],
})
export class RealTimeModule {}
