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
  } catch (error) {
    console.log('error removing songs: ', error)
    res.status(401)
    res.setHeader('Content-Type', 'text/html')
    res.end('Error removing songs')
    return
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html')
  res.end('Success')
}