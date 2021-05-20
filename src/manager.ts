import { EventEmitter } from 'events'
import { readdir } from 'fs/promises'
import { readdirSync } from 'fs'
import { join } from 'path'
import WebSocket from 'ws'
import { ActionHandler, ActionType, Controller, ControllerConstructor, Hook, HookType, NextFn } from './types'

const defaultOptions: Partial<Options<any>> = {
    serializeHandlerAction: (action, path): ActionType => {
        if (path.length > 1) {
            return path.join('::')
        } else {
            return action // preserve original data type
        }
    }
}

export interface Options<T> {
    directory?: string
    mask?: RegExp
    controllers?: ControllerConstructor[] | Controller[]
    initialize?: (generator: ControllerConstructor) => Controller
    serializeHandlerAction?: (action: ActionType, path: string[]) => ActionType
    getData?: (data: unknown) => unknown
    getParams?: (data: unknown, client: T)  => unknown
}

export class ControllerManager<T = WebSocket> extends EventEmitter {
    public controllers: Set<Controller> = new Set()

    private opts: Options<T>

    constructor(opts: Options<T>) {
        super()

        this.opts = {
            ...defaultOptions,
            ...opts,
        }

        if (opts.controllers) {
            this.loadControllers(opts.controllers)
        }
    }

    async init() {
        const { directory } = this.opts
        
        if (directory) {
            const files = await readdir(directory)
            const controllers = files
                .filter(this.filterController.bind(this))
                .map((path) => join(directory, path))

            await this.loadModules(controllers)
        }

        this.emit('ready')
    }

    initSync() {
        const { directory } = this.opts
        
        if (directory) {
            const files = readdirSync(directory)
            const controllers = files
                .filter(this.filterController.bind(this))
                .map((path) => join(directory, path))

            this.loadModulesSync(controllers)
        }

        this.emit('ready')
    }

    private filterController(file: string) {
        if (!file.endsWith('.js') && !file.endsWith('.ts')) {
            return false
        }

        if (this.opts.mask) {
            return this.opts.mask.test(file)
        }

        return true
    }

    private createController(generator: ControllerConstructor | Controller) {
        if (typeof generator === 'function') {
            if (this.opts.initialize) {
                return this.opts.initialize(generator)
            } else {
                return new generator()
            }
        } else {
            return generator
        }
    }

    private setupHandlers(controller: Controller): void {
        const handlers = this.getHandlers(controller).map((handler) => {
            handler.action = this.serializeHandlerAction(handler.action, controller)

            return handler
        })

        this.setHandlers(handlers, controller)
    }

    private setupHooks(controller: Controller): void {
        const hooks = this.getHooks(controller).map((hook) => {
            if (hook.bind) {
                hook.handler = hook.handler.bind(controller)
            }
            
            return hook
        })

        this.setHooks(hooks, controller)
    }

    private setupController(controller: Controller): void {
        this.setupHandlers(controller)
        this.setupHooks(controller)
    }

    private loadController(generator: ControllerConstructor | Controller) {
        const controller = this.createController(generator)

        this.setupController(controller)
        this.controllers.add(controller)
    }

    private loadControllers(controllers: ControllerConstructor[] | Controller[]) {
        controllers.forEach(this.loadController.bind(this))
    }

    private async loadModule(file: string): Promise<void> {
        const mdl = await import(file)
        const generator = mdl.default || mdl

        this.loadController(generator)
    }

    private loadModuleSync(file: string) {
        const mdl = require(file)
        const generator = mdl.default || mdl

        this.loadController(generator)
    }

    private loadModules(files: string[]): Promise<unknown[]> {
        return Promise.all(files.map(this.loadModule.bind(this)))
    }

    private loadModulesSync(files: string[]): void {
        return files.forEach(this.loadModuleSync.bind(this))
    }

    // is this too slow?
    private serializeHandlerAction(action: ActionType, controller: Controller): ActionType {
        const controllerName = Reflect.getMetadata('controller:name', controller)
        const path = []

        if (controllerName) {
            path.push(controllerName)
        }

        path.push(action)

        return this.opts.serializeHandlerAction ?
            this.opts.serializeHandlerAction(action, path)
            : action
    }

    private getHandlers(controller: Controller): ActionHandler[] {
        return Reflect.getMetadata('controller:handlers', controller) || []
    }

    private setHandlers(handlers: ActionHandler[], controller: Controller): void {
        Reflect.defineMetadata('controller:handlers', handlers, controller)
    }

    private getHooks(controller: Controller): Hook[] {
        return Reflect.getMetadata('controller:hooks', controller) || []
    }

    private setHooks(hooks: Hook[], controller: Controller): void {
        Reflect.defineMetadata('controller:hooks', hooks, controller)
    }

    private getParams(data: unknown, client: T) {
        return this.opts.getParams ?
            this.opts.getParams(data, client)
            : {}
    }

    public handle(action: ActionType, data: unknown, client: T) {
        if (this.opts.getData) {
            data = this.opts.getData(data)
        }

        this.controllers.forEach((controller) => {            
            const handlers = this.getHandlers(controller)
                .filter((handler: ActionHandler) => handler.action === action)
            
            if (handlers.length > 0) {
                const hooks = this.getHooks(controller)

                this.runHooks(hooks, 'preHandler', () => {
                    for (const handler of handlers) {
                        controller[handler.method](
                            data,
                            client,
                            this.getParams(data, client)
                        )
                    }
                }, data, client)
            }
        })
    }

    public runHooks(hooks: Hook[], type: HookType, cb: NextFn, data: unknown, client: T, i = 0) {
        const next = () => {
            this.runHooks(hooks, type, cb, data, client, ++i)
        }
        
        if (hooks.length > i) {
            const hook = hooks[i]

            if (hook.type === type) {
                hook.handler(data, client, next)
            } else {
                next()
            }
        } else {
            cb()
        }
    }
}