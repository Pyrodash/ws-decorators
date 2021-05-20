import { ControllerManager, Options } from './manager'
import { Hook, Handler, Controller } from './decorators/'
import { ActionType, NextFn } from './types'
import WebSocket, { Server } from 'ws'

const defaultOptions: Partial<BootstrapOptions<any>> = {
    getAction(data: { action: ActionType }) {
        return data.action
    }
}

export interface BootstrapOptions<T> extends Options {
    getAction?: (data: any) => ActionType
    getClient?: (socket: WebSocket) => T
}

export function bootstrap<T = WebSocket>(server: Server, options: BootstrapOptions<T>) {
    const opts: BootstrapOptions<T> = {
        ...defaultOptions,
        ...options,
    }
    
    const manager = new ControllerManager<T>(opts)
    
    manager.initSync() // block to prevent receiving requests before ready

    server.on('connection', (socket) => {
        socket.on('message', (data) => {
            let packet

            try {
                packet = JSON.parse(data.toString('utf8'))
            } catch(err) {
                packet = null
            }

            if (packet) {
                let client: T

                if (opts.getClient) {
                    client = opts.getClient(socket)
                } else {
                    client = socket as unknown as T
                }

                let action = opts.getAction ?
                    opts.getAction(packet)
                    : packet.action as ActionType
    
                manager.handle(action, packet, client)
            }
        })
    })
}

export {
    ControllerManager,
    Options,
    NextFn,
    Hook,
    Handler,
    Controller,
    ActionType
}
