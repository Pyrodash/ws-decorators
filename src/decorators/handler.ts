import { ActionType } from '../index'
import { ActionHandler } from '../types'

export function Handler(action: ActionType) {
    return function(target: any, propertyKey: string) {
        const handlers: ActionHandler[] = Reflect.getOwnMetadata('controller:handlers', target) || []

        handlers.push({
            action,
            method: propertyKey,
        })

        Reflect.defineMetadata('controller:handlers', handlers, target)
    }
}