import { getPlaylists } from '../../../../lib/spotifyApi'
import { getSession } from 'next-auth/client'

export default async function handler(req, res) {
  const session = await getSession({req})
  if (!session || !session.accessToken) {
    res.status(401)
    res.setHeader('Content-Type', 'text/html')
    res.end('Unauthorized Request')
    return
  }
  
  let playlists = await getPlaylists(session.user.name, session.accessToken).catch(() => {
    res.status(401)
    res.setHeader('Content-Type', 'text/html')
    res.end('Invalid Token')
    return
  })

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(playlists))
}