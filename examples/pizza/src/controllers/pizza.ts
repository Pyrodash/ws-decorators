import { Controller, Handler, NextFn, Hook } from '../../../../src/'
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
    validateB(data: unknown, client: Client, next: NextFn) {
        console.log('validateB')
        next()
    }

    @Handler('order')
    orderPizza(pizza: Pizza, client: Client, params: unknown) {
        console.log(pizza)
        console.log(params)

        client.send({
            action: 'pizza-service::order',
            status: 200,
        })
    }
}