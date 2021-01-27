import { createPlaylist } from '../../../../lib/spotifyApi'
import { getSession } from 'next-auth/client'

export default async function handler(req, res) {
  const session = await getSession({req})
  if (!session || !session.accessToken) {
    res.status(401)
    res.setHeader('Content-Type', 'text/html')
    res.end('Invalid session')
    return
  }

  if (!req.body.name) {
    res.status(401)
    res.setHeader('Content-Type', 'text/html')
    res.end('Invalid body')
    return
  }

  let desc = ''
  let isPublic = true
  if (req.body.description) desc = req.body.description
  if (!req.body.isPublic) isPublic = false 

  try {
    await createPlaylist(req.body.name, desc, isPublic, session.accessToken)
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/html')
    res.end('Success')
  } catch (err) {
    res.status(err.body.error.status)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(err.body))
  }
}