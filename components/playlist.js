import styles from '../styles/Playlist.module.css'
import AudioPlayer from './audioPlayer'
import ActionIcon from './actionIcon'
import PaginationIndex from './paginationIndex'
import Image from './image'
import { formatLengthMs, isEmptyObject, dateToDays } from '../lib/utils'
import Alert from '@material-ui/lab/Alert'
import Slide from '@material-ui/core/Slide'
import Tooltip from '@material-ui/core/Tooltip'
import { useState, useEffect } from 'react'
import axios from 'axios'

const url = 'http://localhost:3000/api/spotify/playlists/'
const limit = 100

export default function Playlists(props) {
  const [playlist, setPlaylist] = useState({})
  const [tracks, setTracks] = useState([])
  const [page, setPage] = useState(1)
  const [playing, setPlaying] = useState(false) // state to manage AudioPlayer
  const [loading, setLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [error, setError] = useState(false) // for action errors
  const [errMsg, setErrMsg] = useState('') // for loading errors

  // mounted
  useEffect(() => {
    loadPlaylistData()
  }, [])

  // clear alertMessage
  useEffect(() => {
    if (!alertMessage) return
    setTimeout(() => {
      setError(false)
      setTimeout(() => {
        setAlertMessage('')
      }, 100);
    }, 2000);
  }, [alertMessage])

  useEffect(() => {
    setLoading(true)
    loadTracks()
  }, [page])
  
  const loadPlaylistData = async () => {
    let path = url + props.playlistID
    try {
      let res = await axios.get(path)
      setPlaylist(res.data)
    } catch (error) {
      let msg = 'Error getting playlist: ' + error.response.data.error.message
      console.log(msg)
      setErrMsg(msg)
    }
  }

  // change to load only current page
  const loadTracks = async () => {
    try {
      setLoadingMessage('Loading tracks...')
      let offset = (page-1)*limit
      let res = await axios.get('/api/spotify/playlists/' + props.playlistID, { params: { tracks: true, offset: offset, limit: limit }})
      let arr = res.data.items
      setTracks(arr)
      setLoading(false)
    } catch (error) {
      console.log('error fetching tracks: ', error)
    }
  }

  const showNext = () => {
    return (playlist.tracks.total > page*limit) ? true : false
  }

  const showBack = () => {
    return (page > 1) ? true : false
  }

  const next = () => {
    if (page*limit < playlist.tracks.total) {
      setPage(page+1)
    } else {
      console.log("can't go to next page")
    }
  }

  const back = () => {
    if (page > 1) {
      setPage(page-1)
    } else {
      console.log("can't go back a page")
    }
  }

  const removeSong = (track, index) => {
    console.log('removing ' + track.name + ' from ' + playlist.name + ' at index ' + index)
    let data = {
      playlistId: playlist.id,
      snapshotId: playlist.snapshot_id,
      index: index
    }
    axios.delete('/api/spotify/remove/song', {data: data})
      .then(() => {
        setAlertMessage('Removed ' + track.name + ' from ' + playlist.name)
        loadPlaylistData() // to update snapshot_id
        loadTracks()

        // update uri set for dashboard
        let uris = new Set(props.urisInPlaylist())
        uris.delete(track.track.uri)
        props.updateUrisInPlaylist(uris)
      }).catch(err => {
        console.log('Error removing song from playlist: ', err)
        setError(true)
        setAlertMessage('Error removing song from playlist')
      })
  }

  const removeAlbum = async (album) => {
    console.log('Removing ' + album.name + ' from playlist')
    

    // declaring variables to use in the loop below
    let max = Math.ceil(album.total_tracks/50)
    let res
    let params = {
      tracks: true,
      limit: 50
    }
    let uris
    let arr
    let trackArr
    let data

    // get tracks in album
    for (let i = 0; i < max; i++) {
      params.offset = i*50
      res = await axios.get('/api/spotify/album/' + album.id, { params: params })

      // generate array of track uris
      // filter out tracks already in playlist
      uris = props.urisInPlaylist()
      arr = res.data.items.map(track => {
        if (uris.has(track.uri))
          return track.uri
      }).filter(x => x !== undefined)

      // build array in the form [{uri: 'foo'}]
      trackArr = arr.map(x => {
        return {uri: x}
      })

      data = {
        playlistId: playlist.id,
        snapshotId: playlist.snapshot_id,
        tracks: trackArr
      }
      axios.delete('/api/spotify/remove/songs', {data: data})
        .then(() => {
          setAlertMessage('Removed ' + album.name + ' from ' + playlist.name)
          loadPlaylistData() // to update snapshot_id
          loadTracks()
          
          // update uri set for dashboard
          let uris = new Set(props.urisInPlaylist())
          arr.forEach(uri => {
            uris.delete(uri)
          })
          props.updateUrisInPlaylist(uris)
        }).catch(err => {
          console.log('Error removing album from playlist: ', err)
          setError(true)
          setAlertMessage('Error removing album from playlist')
        })
    }
  }

  if (errMsg) return <div className="message">{errMsg}</div>
  if (isEmptyObject(playlist)) return <div className="message">Loading...</div>
  return (
    <div className={styles.container}>
      <Slide direction="down" in={alertMessage ? true : false}>
        <Alert className="alert" severity={error ? 'error' : 'success'}>{alertMessage}</Alert>
      </Slide>
      {/* image */}
      {playlist.images &&
        <div className={styles.imageContainer}>
          <div className={styles.backArrow}>
            {showBack() &&
              <ActionIcon
                icon="keyboard_arrow_left"
                onClick={() => back()}
                changeAfterClick={false}
                resetOnClick
                resetTime="500"
              />
            }
          </div>
          <div className="pageImg">
            <Image images={playlist.images} />
          </div>
          <div className={styles.nextArrow}>
            {showNext() && 
              <ActionIcon
                icon="keyboard_arrow_right"
                onClick={() => next()}
                changeAfterClick={false}
                resetOnClick
                resetTime="500"
              />
            }
          </div>
        </div>
      }
      {/* description */}
      {playlist.description && <>
        <div className={styles.description}>{playlist.description}</div>
      </>}

      {/* info */}
      {playlist && <>
        <div className={styles.info}>
          {tracks.length > 0 && <>
            {playlist.tracks.total} song{playlist.tracks.total == 1 ? '' : 's'}
          </>}
        </div>
      </>}

      {/* pagination */}
      {playlist &&
        <div className={styles.pagination}>
          <PaginationIndex
            currentPage={page}
            total={Math.ceil(playlist.tracks.total / limit)}
            select={setPage}
          />
        </div>
      }

      {/* songs */}
      <div className={styles.songs}>
        {loading && <p className="smallMessage">{loadingMessage}</p>}
        {(!loading && tracks.length == 0) && <p className="smallMessage">This playlist is empty, click the search icon to get started!</p>}
        {(!loading && tracks.length > 0) && <>
          <div className={`${styles.song} ${styles.header}`}>
            <div className={styles.title}>Title</div>
            <div className={styles.artist}>Artist</div>
            <div className={styles.album}>Album</div>
            <div className={styles.length}>Length</div>
            <div className={styles.date}>Date Added</div>
            <div className={styles.actions}>Actions</div>
          </div>
          {tracks.map((song, songIndex) => {
            if (!song) return <div key={songIndex}>Error, no song</div>
            return (
              <div className={styles.song} key={songIndex}>
                <div className={styles.title}>{song.track.name}</div>
                <div className={styles.artist}>{song.track.artists.map((artist, artistIndex) => {
                  return (<span key={artist.id}>
                    {artistIndex == 0 ? '' : ', '}
                    <a onClick={() => props.select(artist)}>
                      {artist.name}
                    </a>
                  </span>)
                })}</div>
                <div className={styles.album}>
                  <a onClick={() => props.select(song.track.album)}>
                    {song.track.album.name}
                  </a>
                </div>
                <div className={styles.length}>{formatLengthMs(song.track.duration_ms)}</div>
                <div className={styles.date}>{dateToDays(song.added_at)}</div>
                <div className={styles.actions}>
                  <AudioPlayer 
                    url={song.track.preview_url}
                    isPlaying={playing}
                    updatePlaying={(val) => setPlaying(val)}
                  />
                  {/* <i 
                    className={`${styles.icon} material-icons ${styles.remove}`}
                    onClick={() => removeSong(song, songIndex)}
                    >delete</i> */}
                  <ActionIcon
                    icon="delete"
                    onClick={() => removeSong(song, songIndex)}
                    isError={error}
                    color="#f44336"
                    changeAfterClick={false}
                    resetOnClick
                  />
                  <Tooltip
                    id="remove-tooltip"
                    title="Delete Album"
                    placement="top"
                  >
                    <i 
                      className={`${styles.icon} material-icons ${styles.remove}`}
                      onClick={() => removeAlbum(song.track.album)}
                    >layers_clear</i>
                  </Tooltip>
                  {/* alternatives: disc_full, grid_off */}
                </div>
              </div>
            )
          })}
        </>}
      </div>

      {/* pagination */}
      {(playlist && tracks.length > 10) &&
        <PaginationIndex
          currentPage={page}
          total={Math.ceil(playlist.tracks.total / limit)}
          select={setPage}
        />
      }
    </div>
  )
}