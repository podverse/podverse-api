import { pullPodpingImage } from './services/podping'

/*
  Run startup functions one time in the background.
  This should only be run in prod, or when you're sure you need it in development.
*/
export const startup = async () => {
  if (process.env.NODE_ENV === 'production') {
    await pullPodpingImage()
  }
}
