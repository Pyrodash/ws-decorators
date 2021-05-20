import { HookFn } from '../types'
import { addHook } from './hook'

export interface ControllerOptions {
    name?: string
    preHandler?: HookFn
}

export function Controller(name: string): Function

export function Controller(opts: ControllerOptions): Function

export function Controller(opts: any) {
    return function (target: any) {
        if (typeof opts === 'string') {
            opts = { name: opts }
        }

        if (opts.name) {
            Reflect.defineMetadata('controller:name', opts.name, target.prototype)
        }

        if (opts.preHandler) {
            addHook('preHandler', opts.preHandler, target.prototype)
        }
    }
}