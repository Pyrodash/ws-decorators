import 'reflect-metadata'
import { bootstrap } from '../../src/'
import WebSocket, { Server } from 'ws'
import { join } from 'path'

const port = 4010
const server = new Server({ port })

bootstrap(server, {
    directory: join(__dirname, 'controllers'),
})

const client = new WebSocket(`ws://127.0.0.1:${port}`)

client.once('open', () => {
    client.send(JSON.stringify({
        action: 'pizza-service::order',
        toppings: ['mushroom']
    }))
})

client.on('message', (data) => {
    console.log(data.toString('utf8'))
})