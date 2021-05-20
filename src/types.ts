export type HandlerFn = (data: any, client: any) => void
export type NextFn = () => void

export type HookType = 'preHandler'
export type HookFn = (data: any, client: any, next: NextFn) => void

export type ActionType = string | number

export interface ActionHandler {
    action: ActionType
    method: string
}

export interface Hook {
    type: HookType
    handler: HookFn
    bind?: boolean
}

export type Controller = {
    [key: string]: HandlerFn
}

export interface ControllerConstructor {
    new(): Controller
}
