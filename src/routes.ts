import * as Router from 'koa-router'
const controller = require('./controller')

const router = new Router()

router.get('/', controller.general.helloWorld)

export { router }
