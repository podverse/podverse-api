import { BaseContext } from 'koa'

export default class GeneralController {

  public static async helloWorld (ctx: BaseContext) {
    ctx.body = 'Hellloooo world!'
  }

}
