import { Controller } from '../../../src/decorators/controller'
import WebSocket from 'ws'
import { Handler } from '../../../src/decorators/handler'
import { NextFn } from 'types'
import { Hook } from '../../../src/decorators/hook'

interface Pizza {
    toppings: string[]
}

function requireAuth(data: unknown, client: WebSocket, next: NextFn) {
    console.log('requireAuth')
    next()
}

@Controller({ name: 'pizza-service', preHandler: requireAuth })
export default class PizzaController {
    @Hook('preHandler')
    validateA(data: unknown, client: WebSocket, next: NextFn) {
        console.log('validateA')
        next()
    }

    @Hook('preHandler')
    validateb(data: unknown, client: WebSocket, next: NextFn) {
        console.log('validateB')
        next()
    }

    @Handler('order')
    orderPizza(pizza: Pizza, client: WebSocket) {
        console.log(pizza)

        client.send(JSON.stringify(
            {
                action: 'pizza-service::order',
                status: 200,
            }
        ))
    }
}