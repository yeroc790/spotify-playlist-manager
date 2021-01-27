import { getPlaylist, getPlaylistTracks, getPlaylistUris } from '../../../../lib/spotifyApi'
import { getSession } from 'next-auth/client'

export default async function handler(req, res) {
  const {
    query: { 
      playlistId: playlistId,
      tracks: tracks,
      uris: uris,
      offset: offset,
    }
  } = req

  const session = await getSession({req})
  if (!session || !session.accessToken) {
    res.status(401)
    res.setHeader('Content-Type', 'text/html')
    res.end('Invalid session')
    return
  }

  try {
    let data
    let o = offset
    if (!offset) o = 0
    if (tracks) {
      data = await getPlaylistTracks(playlistId, o, session.accessToken)
    } else if (uris) {
      data = await getPlaylistUris(playlistId, o, session.accessToken)
    } else {
      data = await getPlaylist(playlistId, session.accessToken)
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