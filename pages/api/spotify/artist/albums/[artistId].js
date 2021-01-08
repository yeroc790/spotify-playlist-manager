import { getArtistAlbums } from '../../../../../lib/spotifyApi'
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

  let albums = await getArtistAlbums(artistId, session.accessToken)
    .catch(() => {
      res.status(401)
      res.setHeader('Content-Type', 'text/html')
      res.end('Error getting albums')
      return
    })

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(albums))
}