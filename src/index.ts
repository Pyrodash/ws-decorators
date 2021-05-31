import { ControllerManager, Options } from './manager'
import { Hook, Handler, Controller } from './decorators/'
import { ActionType, NextFn } from './types'
import WebSocket, { Server } from 'ws'

const defaultOptions: Partial<BootstrapOptions<any>> = {}

export interface BootstrapOptions<T> extends Options<T> {
    getClient?: (socket: WebSocket) => T
}

export function bootstrap<T = WebSocket>(
    server: Server,
    options: BootstrapOptions<T>
): ControllerManager<T> {
    const opts: BootstrapOptions<T> = {
        ...defaultOptions,
        ...options,
    }
    
    const manager = new ControllerManager<T>(opts)
    
    manager.initSync() // block to prevent receiving requests before ready

    server.on('connection', (socket) => {
        let client: T

        if (opts.getClient) {
            client = opts.getClient(socket)
        } else {
            client = socket as unknown as T
        }

        socket.on('message', (data) => {
            manager.process(data, client)
        })
    })

    return manager
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
