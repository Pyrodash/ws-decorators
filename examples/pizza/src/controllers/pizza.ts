import { Controller } from '../../../../src/decorators/controller'
import { Handler } from '../../../../src/decorators/handler'
import { NextFn } from '../../../../src/types'
import { Hook } from '../../../../src/decorators/hook'
import { Client } from '../client'

interface Pizza {
    toppings: string[]
}

function requireAuth(data: unknown, client: Client, next: NextFn) {
    console.log('requireAuth')
    next()
}

@Controller({ name: 'pizza-service', preHandler: requireAuth })
export default class PizzaController {
    @Hook('preHandler')
    validateA(data: unknown, client: Client, next: NextFn) {
        console.log('validateA')
        next()
    }

    @Hook('preHandler')
    validateb(data: unknown, client: Client, next: NextFn) {
        console.log('validateB')
        next()
    }

    @Handler('order')
    orderPizza(pizza: Pizza, client: Client) {
        console.log(pizza)

        client.send({
            action: 'pizza-service::order',
            status: 200,
        })
    }
}