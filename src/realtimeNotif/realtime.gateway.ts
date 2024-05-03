import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(8001, { cors: "*" })
export class RealTimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  handleDisconnect(client: any) {
    
  }
  handleConnection(client: any, ...args: any[]) {
  }
  @WebSocketServer() server: Server;
  private clients: Socket[] = []; // Stocker une liste de clients connectés

 

  getAllClients(): Socket[] {
    return this.clients;
  }

  @SubscribeMessage('documentCreated')
  handleDocumentCreated(payload: any) {
    this.server.emit('documentCreated', payload);
  }
}
