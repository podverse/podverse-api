import { config } from '~/config'
import { request } from '~/lib/request'
import { cleanFileExtension, convertToSlug } from '~/lib/utility'
import { s3 } from '~/services/aws'

const sharp = require('sharp')

const { awsConfig, shrunkImageSize } = config
const { imageCloudFrontOrigin, imageS3BucketName } = awsConfig

// This handles requesting the original image from the podcaster's server,
// shrinking the image, then PUTing it on our S3 bucket.
export const shrinkImage = async (podcast: any) => {
  try {
    const imgResponse = await request(podcast.imageUrl, {
      timeout: 5000,
      encoding: null
    })

    const shrunkImage = await sharp(imgResponse).resize(shrunkImageSize).toBuffer()

    const parts = podcast.imageUrl.split('.')
    let fileExtension = parts[parts.length - 1]
    fileExtension = cleanFileExtension(fileExtension)

    const slug = podcast.title ? convertToSlug(podcast.title) : 'image'
    const filePath = `podcast-images/${podcast.id}/`
    const fileName = `${slug}.${fileExtension}`

    const s3Params = {
      Bucket: imageS3BucketName,
      Key: filePath + fileName,
      Body: shrunkImage
    }

    const result = await s3.upload(s3Params).promise()

    return imageCloudFrontOrigin + '/' + result.key
  } catch (error) {
    console.log('Image saving failed')
    console.log('title', podcast.title)
    console.log('imageUrl', podcast.imageUrl)
    console.log(error)
    return null
  }
}
