var SpotifyWebApi = require('spotify-web-api-node')

// Generates a new SpotifyWebApi object
export function getSpotifyApi(token) {
  let spotifyApi = new SpotifyWebApi({
    redirectUri: process.env.REDIRECT_URI,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    state: process.env.STATE
  })
  if (token) {
    spotifyApi.setAccessToken(token)
  }
  return spotifyApi
}

export function getLoginURL() {
  var scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-read-private',
    'playlist-modify-public',
    'playlist-modify-private'
  ],
    // state = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) // need to verify that state stays the same
    state = process.env.STATE

  let spotifyApi = getSpotifyApi()
  return spotifyApi.createAuthorizeURL(scopes, state) + '&show_dialog=true'
}

export async function getUserInfo() {
  let spotifyApi = getSpotifyApi()

  try {
    let userInfo = await spotifyApi.getMe()
    return userInfo.body
  } catch (err) {
    throw new Error('Could not get user info: ', err)
  }
}

export function getAlbums() {
  console.log("Get albums called")
  console.log("spotifyApi: ", getSpotifyApi())
}

export async function getPlaylists(username, offset, limit, token) {
  let spotifyApi = getSpotifyApi(token)
  if (!offset) offset = 0
  if (!limit) limit = 20
  try {
    let data = await spotifyApi.getUserPlaylists(username, {offset: offset, limit: limit})
    return data.body
  } catch (error) {
    console.error('Something went wrong! ', error.body.error)
    throw new Error("Something went wrong! ", error)
  }
}

export async function getPlaylist(playlistID, token) {
  let spotifyApi = getSpotifyApi(token)

  try {
    let data = await spotifyApi.getPlaylist(playlistID)
    return data.body
  } catch (error) {
    console.error('Something went wrong! ', error.body.error)
    throw new Error("Something went wrong! ", error)
  }
}

export async function getPlaylistTracks(playlistID, offset, limit, token) {
  let spotifyApi = getSpotifyApi(token)
  if (!offset) offset = 0
  if (!limit) limit = 100
  try {
    let data = await spotifyApi.getPlaylistTracks(playlistID, {offset: offset, limit: limit})
    return data.body
  } catch (error) {
    console.error('Something went wrong! ', error.body.error)
    throw new Error("Something went wrong! ", error)
  }
}

export async function getPlaylistUris(playlistID, offset, limit, token) {
  let spotifyApi = getSpotifyApi(token)
  if (!offset) offset = 0
  if (!limit) limit = 100
  let options = {
    offset: offset,
    limit: limit,
    fields: 'items.track.uri'
  }

  try {
    let data = await spotifyApi.getPlaylistTracks(playlistID, options)
    return data.body
  } catch (error) {
    console.error('Something went wrong! ', error.body.error)
    throw new Error("Something went wrong! ", error)
  }
}

export async function getArtist(artistID, token) {
  let spotifyApi = getSpotifyApi(token)

  try {
    let data = await spotifyApi.getArtist(artistID)
    return data.body
  } catch (error) {
    console.log('Something went wrong! ', error.body.error)
    throw error
  }
}

export async function getArtistAlbums(artistID, offset, limit, token) {
  let spotifyApi = getSpotifyApi(token)
  if (!offset) offset = 0
  if (!limit) limit = 20
  try {
    let data = await spotifyApi.getArtistAlbums(artistID, {market: 'from_token', offset: offset, limit: limit})
    return data.body
  } catch (error) {
    console.error('Something went wrong! ', error.body.error)
    throw new Error("Something went wrong! ", error)
  }
}

export async function getAlbum(albumID, token) {
  let spotifyApi = getSpotifyApi(token)
  try {
    let data = await spotifyApi.getAlbum(albumID)
    return data.body
  } catch (error) {
    console.error('Something went wrong! ', error.body.error)
    throw new Error("Something went wrong! ", error)
  }
}

export async function getAlbumTracks(albumID, offset, limit, token) {
  let spotifyApi = getSpotifyApi(token)
  if (!limit) limit = 50
  if (!offset) offset = 0
  try {
    let data = await spotifyApi.getAlbumTracks(albumID, { limit: limit, offset: offset })
    return data.body
  } catch (error) {
    console.error('Something went wrong! ', error.body.error)
    throw new Error("Something went wrong! ", error)
  }
}

export async function addSong(playlistId, songs, token) {
  let spotifyApi = getSpotifyApi(token)

  try {
    await spotifyApi.addTracksToPlaylist(playlistId, songs)
  } catch (error) {
    console.error('Something went wrong! ', error.body.error)
    throw error
  }
}

export async function createPlaylist(name, description, isPublic, token) {
  let spotifyApi = getSpotifyApi(token)

  try {
    await spotifyApi.createPlaylist(name, { 'description': description, 'public': isPublic })
  } catch (error) {
    console.error('Something went wrong! ', error.body.error)
    throw error
  }
}

export async function editPlaylist(playlistId, name, description, isPublic, token) {
  let spotifyApi = getSpotifyApi(token)

  let options = {
    name: name,
    public: isPublic
  }
  if (description)
  options.description = description

  try {
    await spotifyApi.changePlaylistDetails(playlistId, options)
  } catch (error) {
    console.error('Something went wrong! ', error.body.error)
    throw error
  }
}

export async function removeSong(playlistId, index, snapshotId, token) {
  let spotifyApi = getSpotifyApi(token)

  try {
    await spotifyApi.removeTracksFromPlaylistByPosition(playlistId, [index], snapshotId)
  } catch (error) {
    console.error('Something went wrong! ', error.body.error)
    throw error
  }
}

export async function removeSongs(playlistId, tracks, snapshotId, token) {
  let spotifyApi = getSpotifyApi(token)
  let options = { snapshot_id: snapshotId}

  try {
    await spotifyApi.removeTracksFromPlaylist(playlistId, tracks, options)
  } catch (error) {
    console.error('Something went wrong! ', error.body.error)
    throw error
  }
}

export async function searchSpotify(str, type, token) {
  let spotifyApi = getSpotifyApi(token)

  if ((type != 'artist') && (type != 'track') && (type != 'album')) {
    type = 'artist'
  }

  try {
    let data = await spotifyApi.search(str, [type], {market: 'from_token'})
    return data.body
  } catch (error) {
    console.error('Something went wrong! ', error.body.error)
    throw error
  }
}