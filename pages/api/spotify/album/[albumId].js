import { getAlbum } from '../../../../lib/spotifyApi'
import { getSession } from 'next-auth/client'

export default async function handler(req, res) {
  let err = false
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

  // switching logic isn't working (but for now that's ok, maybe fix later for optimization)
  // see /playlist/[playlistId] for correct implementation of params

  let playlist
  if (req.body.tracks) {
    playlist = await getAlbumTracks(albumId, session.accessToken)
      .catch(() => {err = true})
  } else {
    playlist = await getAlbum(albumId, session.accessToken)
      .catch(() => {err = true})
  }

  if (err) {
    res.status(401)
    res.setHeader('Content-Type', 'text/html')
    res.end('Unauthorized Request')
  } else {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(playlist))
  }
}