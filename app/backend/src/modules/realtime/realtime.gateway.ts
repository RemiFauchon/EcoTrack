import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

/**
 * Passerelle temps réel : pousse les mises à jour métier vers le dashboard
 * (pattern Observer / event-driven). Côté client : socket.on('container:update'), etc.
 */
@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(RealtimeGateway.name);

  handleConnection(client: Socket) {
    this.logger.debug(`Client connecté: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Client déconnecté: ${client.id}`);
  }

  emitContainerUpdate(payload: unknown) {
    this.server?.emit('container:update', payload);
  }

  emitAlert(payload: unknown) {
    this.server?.emit('alert:new', payload);
  }

  emitRoutePlanned(payload: unknown) {
    this.server?.emit('route:planned', payload);
  }

  emitSignalement(payload: unknown) {
    this.server?.emit('signalement:new', payload);
  }
}
