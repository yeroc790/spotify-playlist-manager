import { removeSongs } from '../../../../lib/spotifyApi'
import { getSession } from 'next-auth/client'

export default async function handler(req, res) {
  const session = await getSession({req})
  if (!session || !session.accessToken) {
    res.status(401)
    res.setHeader('Content-Type', 'text/html')
    res.end('Invalid session')
    return
  }

  if (!req.body.playlistId || !req.body.tracks || !req.body.snapshotId) {
    res.status(401)
    res.setHeader('Content-Type', 'text/html')
    res.end('Invalid body')
    return
  }

  try {
    await removeSongs(req.body.playlistId, req.body.tracks, req.body.snapshotId, session.accessToken)
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html')
    res.end('Success')
  } catch (err) {
    res.status(err.body.error.status)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(err.body))
  }
}