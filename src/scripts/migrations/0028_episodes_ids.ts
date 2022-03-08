import { getConnection } from 'typeorm'
import { connectToDb } from '~/lib/db'
;(async function () {
  try {
    await connectToDb()
    console.log('start 0028_episodes_ids.ts')

    // There are just over 80 million episodes at the moment.
    for (let i = 0; i <= 8000; i++) {
      console.log('row count', i * 10000)
      await getConnection()
        .createEntityManager()
        .query(
          `UPDATE episodes SET int_id = nextval('episodes_int_id_seq') WHERE id IN (SELECT id FROM episodes WHERE int_id IS NULL LIMIT 10000);`
        )

      await getConnection().createEntityManager().query(`VACUUM episodes`)
    }

    console.log('finished 0028_episodes_ids.ts')
  } catch (error) {
    console.log(error)
  }
})()
