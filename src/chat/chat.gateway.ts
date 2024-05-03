import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';

@WebSocketGateway(8001, { cors: "*" })
export class ChatGateway {
  @WebSocketServer()
  server;
  connectedUsers: string[] = [];
  cursorPositions: Record<string, { x: number, y: number }> = {};

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
  handleEdit(@MessageBody() updatedContent: { content: string }): void {
    this.server.emit('updateContent', updatedContent);
  }  


  @SubscribeMessage('connected')
  handleConnectedUser(@MessageBody() user: string): void {
    if (!this.connectedUsers.includes(user)) {
      this.connectedUsers.push(user);
      this.server.emit('connected', this.connectedUsers);
    }
  }
  
  @SubscribeMessage('disconnected')
  handleDisconnectedUser(@MessageBody() user: string): void {
    this.connectedUsers = this.connectedUsers.filter((u) => u !== user);
    this.server.emit('connected', this.connectedUsers);
  }
  @SubscribeMessage('cursorUpdate')
  handleCursorUpdate(@MessageBody() cursorData: { userId: string, x: number, y: number }): void {
    this.cursorPositions[cursorData.userId] = { x: cursorData.x, y: cursorData.y };
    this.server.emit('cursorUpdate', cursorData); // Broadcast the cursor update to all clients
  }  
}