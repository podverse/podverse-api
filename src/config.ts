const env = process.env
const mustHavePodcast = env.MEDIA_REF_HAS_PODCAST || false
const mustHaveUser = env.MEDIA_REF_HAS_USER || false

const entityRelationships = {
  mediaRef: {
    mustHavePodcast,
    mustHaveUser
  }
}

export default {
  entityRelationships
}
