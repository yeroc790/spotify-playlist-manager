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
  let isPrivate = false
  if (req.body.description) desc = req.body.description
  if (req.body.isPrivate) isPrivate = true 

  try {
    await createPlaylist(req.body.name, desc, isPrivate, session.accessToken)
  } catch (error) {
    console.log('error adding song: ', error)
    res.status(401)
    res.setHeader('Content-Type', 'text/html')
    res.end('Error adding song')
    return
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'text/html')
  res.end('Success')
}