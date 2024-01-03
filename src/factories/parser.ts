import { ParserService } from 'podverse-parser'
import { config } from '../config'

export const parserInstance = new ParserService({
  userAgent: config.userAgent
})
