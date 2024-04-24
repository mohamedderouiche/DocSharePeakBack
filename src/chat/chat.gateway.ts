import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway(8001, { cors: "*" })
export class ChatGateway {
  @WebSocketServer()
  server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: { text: string, user: string }): void {
    console.log(message);
    this.server.emit('message', message);
  }

  @SubscribeMessage('typing')
  handleTyping(@MessageBody() isTyping: boolean): void {
    this.server.emit('typing', isTyping);
  }
  @SubscribeMessage('edit')
  handleEdit(@MessageBody() updatedContent: { blocks: any[] }): void {
    this.server.emit('updateContent', updatedContent);
  }  
}