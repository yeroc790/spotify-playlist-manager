import { getSession } from 'next-auth/client'
import { searchSpotify } from '../../../../lib/spotifyApi'

export default async function handler(req, res) {
  const {
    query: { param }
  } = req

  if (param.length > 2 || param.length < 1) {
    res.status(404)
    res.setHeader('Content-Type', 'text/html')
    res.end('Invalid Path')
    return
  }
  
  const session = await getSession({req})
  if (!session || !session.accessToken) {
    res.status(404)
    res.setHeader('Content-Type', 'text/html')
    res.end('Invalid Session')
    return
  }

  let str = param[0]
  let type = (param.length == 2) ? param[1] : ''
  
  try {
    let results = await searchSpotify(str, type, session.accessToken)
    res.status(200)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
  } catch (err) {
    res.status(err.body.error.status)
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(err.body))
  }
}