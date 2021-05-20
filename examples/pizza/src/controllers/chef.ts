import { Client } from '../client';
import { Controller, Handler } from '../../../../src/'

@Controller({ name: 'chef-service' })
export default class ChefController {
    @Handler('thank')
    thankChef(data: unknown, client: Client) {
        console.log('Someone thanked the chef!')
        
        client.send({
            action: 'chef-service::reply',
            message: `You're welcome :)`,
        })
    }
}