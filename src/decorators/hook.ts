import { ControllerConstructor, HandlerFn, Hook, HookType } from '../types'

export function addHook(
    type: HookType,
    handler: HandlerFn,
    target: ControllerConstructor,
    bind = false
) {
    const hooks: Hook[] = Reflect.getOwnMetadata('controller:hooks', target) || []

    hooks.push({
        type,
        handler,
        bind,
    })

    Reflect.defineMetadata('controller:hooks', hooks, target)
}

export function Hook(type: HookType) {
    return function(target: any, propertyKey: string, propertyDescriptor: PropertyDescriptor) {
        addHook(type, propertyDescriptor.value, target, true)
    }
}
