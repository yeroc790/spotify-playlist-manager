import { getPlaylists } from '../../../../lib/spotifyApi'
import { getSession } from 'next-auth/client'

export default async function handler(req, res) {
  const {
    query: {
      offset: offset
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
    let o = offset
    if (!offset) o = 0
    let playlists = await getPlaylists(session.user.name, o, session.accessToken)
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(playlists))
  } catch (err) {
    res.status(err.body.error.status)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(err.body))
  }
}