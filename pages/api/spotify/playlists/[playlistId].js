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

  let playlist
  let err = false
  let o = offset
  if (!offset) o = 0
  if (tracks) {
    playlist = await getPlaylistTracks(playlistId, o, session.accessToken)
      .catch(() => {err = true})
  } else if (uris) {
    playlist = await getPlaylistUris(playlistId, o, session.accessToken)
      .catch(() => {err = true})
  } else {
    playlist = await getPlaylist(playlistId, session.accessToken)
      .catch(() => {err = true})
  }

  if (err) {
    res.status(401)
    res.setHeader('Content-Type', 'text/html')
    res.end('Error getting playlist')
    return
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(playlist))
}