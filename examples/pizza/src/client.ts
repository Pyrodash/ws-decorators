import WebSocket from 'ws'

export class Client {
    private socket: WebSocket

    constructor(socket: WebSocket) {
        this.socket = socket
    }

    send(data: unknown): void {
        this.socket.send(JSON.stringify(data))
    }
}
