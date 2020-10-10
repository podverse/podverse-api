import { config } from '~/config'
import { s3 } from '~/services/aws'
const fs = require('fs')
const path = require('path')

const { awsConfig } = config
const { backupDatbaseS3BucketName } = awsConfig

export const backupDatabaseToS3 = async () => {
  try {

    const yyyymmdd = new Date().toISOString().slice(0, 10)
    const filename = `${yyyymmdd}-daily/postgres.sql.gz`
    const fileContent = fs.createReadStream(path.resolve(__dirname, `../../../db-backups/${filename}`))

    const s3Params = {
      Bucket: backupDatbaseS3BucketName,
      Key: filename,
      Body: fileContent,
      ContentType: 'application/javascript',
      ContentEncoding: 'gzip'
    }

    await s3.upload(s3Params)
      .on('httpUploadProgress', function (evt) { console.log(evt); })
      .send(function (err, data) { console.log(err, data) })
  } catch (error) {
    console.log('Database backup upload failed')
    console.log(error)
  }
}
