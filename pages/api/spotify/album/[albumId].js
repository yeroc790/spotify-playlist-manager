import { getAlbum, getAlbumTracks } from '../../../../lib/spotifyApi'
import { getSession } from 'next-auth/client'

export default async function handler(req, res) {
  const {
    query: { 
      albumId: albumId,
      offset: offset,
      limit: limit,
      tracks: tracks
    }
  } = req

  const session = await getSession({req})
  if (!session || !session.accessToken) {
    res.status(401)
    res.setHeader('Content-Type', 'text/html')
    res.end('Unauthorized Request')
    return
  }

  try {
    let data
    if (tracks) {
      data = await getAlbumTracks(albumId, offset, limit, session.accessToken)
      // data = {items: arr}
    } else {
      data = await getAlbum(albumId, session.accessToken)
    }
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(data))
  } catch (err) {
    res.status(err.body.error.status)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(err.body))
  }
}