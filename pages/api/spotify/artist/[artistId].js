import { getArtist } from '../../../../lib/spotifyApi'
import { getSession } from 'next-auth/client'

export default async function handler(req, res) {
  const {
    query: { artistId }
  } = req

  const session = await getSession({req})
  if (!session || !session.accessToken) {
    res.status(401)
    res.setHeader('Content-Type', 'text/html')
    res.end('Invalid session')
    return
  }

  try {
    let artist = await getArtist(artistId, session.accessToken)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(artist))
  } catch (err) {
    res.status(err.body.error.status)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(err.body))
  }
}