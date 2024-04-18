import { getConnection } from 'typeorm'
import { _logEnd, _logStart, logPerformance } from '~/lib/utility'
const json2csv = require('json-2-csv')

const generateDeadRowsCSV = async () => {
  logPerformance('generateDeadRowCSV', _logStart)
  const em = await getConnection().createEntityManager()
  const results = await em.query(`
    SELECT n_live_tup, n_dead_tup, relname
    FROM pg_stat_all_tables
    ORDER BY n_dead_tup DESC;
  `)

  const csv = json2csv.json2csv(results)
  console.log('csv', csv)

  logPerformance('generateDeadRowCSV', _logEnd)
}

export { generateDeadRowsCSV }
