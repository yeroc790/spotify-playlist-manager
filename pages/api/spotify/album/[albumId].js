import { getAlbum } from '../../../../lib/spotifyApi'
import { getSession } from 'next-auth/client'

export default async function handler(req, res) {
  const {
    query: { albumId }
  } = req

  const session = await getSession({req})
  if (!session || !session.accessToken) {
    res.status(401)
    res.setHeader('Content-Type', 'text/html')
    res.end('Unauthorized Request')
    return
  }

  // switching logic (req.body.tracks) isn't working (but for now that's ok, maybe fix later for optimization)
  // see /playlist/[playlistId] for correct implementation of params
  
  let data
  try {
    if (req.body.tracks) {
      data = await getAlbumTracks(albumId, session.accessToken)
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