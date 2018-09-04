import * as Koa from 'koa'

const app = new Koa()

app.use(async ctx => {
  ctx.body = 'It works still!'
})

app.listen(3000)
