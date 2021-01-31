import styles from '../styles/Album.module.css'
import AudioPlayer from './audioPlayer'
import ActionIcon from './actionIcon'
import PaginationIndex from './paginationIndex'
import Image from './image'
import { formatLengthMs, isEmptyObject } from '../lib/utils'
import { useState, useEffect } from 'react'
import axios from 'axios'
import moment from 'moment'

const url = 'http://localhost:3000/api/spotify/album/'
const limit = 50

export default function Albums(props) {
  const [album, setAlbum] = useState({})
  const [tracks, setTracks] = useState([])
  const [playing, setPlaying] = useState(false)
  const [errMsg, setErrMsg] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadAlbum()
  }, [])

  useEffect(() => {
    loadTracks()
  }, [props.savedTracks])

  useEffect(() => {
    loadTracks()
  }, [page])

  // takes album object and formats it
  const parseTracks = (data) => {
    if (!data.items || data.items.length == 0) return

    // set inPlaylist property for each track
    let items = data.items.map(track => {
      if (props.savedTracks.has(track.uri))
        track.inPlaylist = true
      else track.inPlaylist = false
      return track
    })
    data.items = items
    setTracks(data)
  }
  
  const loadAlbum = async () => {
    let path = url + props.albumID
    try {
      let res = await axios.get(path)
      setAlbum(res.data)
    } catch (err) {
      let msg = 'Error getting album: ' + err.response.data.error.message
      console.log(msg)
      setErrMsg(msg)
    }
  }

  const loadTracks = async () => {
    let path = url + props.albumID
    try {
      let offset = (page-1)*limit
      let params = {
        tracks: true,
        offset: offset,
        limit: limit
      }
      let res = await axios.get(path, { params: params })
      parseTracks(res.data)
    } catch (err) {
      let msg = 'Error getting album tracks: ' + err.response.data.error.message
      console.log(msg)
      setErrMsg(msg)
    }
  }

  const filterArtists = (artists) => {
    let arr = artists.filter(artist => {
      if (artist.name == album.artists[0].name) return
      return artist
    })
    return arr
  }

  const formatDate = (dateStr) => {
    if (!album) return
    let format = ''
    if (album.release_date_precision == 'day')
      // format = 'M/DD/YYYY'
      format = 'MMM YYYY'
    else if (album.release_date_precision == 'month')
      format = 'MMM YYYY'
    else format = 'YYYY'
    return moment(dateStr).format(format)
  }
  
  if (errMsg) return <div className="message">{errMsg}</div>
  if (isEmptyObject(album)) return <div className="message">Loading...</div>
  return (
    <div className={styles.container}>
      {/* image */}
      {album.images &&
        <div className="pageImg">
          <Image images={album.images} />
        </div>
      }
      
      {/* artist */}
      {album.artists && <>
        <p className={styles.artists}>
          {album.artists.map((artist, index) => {
            if (artist.name == 'Various Artists') return artist.name
            return (<span key={index}>
              {index == 0 ? '' : ', '}
              <a onClick={() => props.select(artist)}>
                {artist.name}
              </a>
            </span>)
          })}
        </p>
      </>}

      {/* album info */}
      {album.release_date &&
        <div className={styles.info}>
          {formatDate(album.release_date)} | {album.tracks.total} song{album.tracks.total.length == 1 ? '' : 's'}
        </div>
      }

      {/* pagination */}
      {album &&
        <PaginationIndex
          currentPage={page}
          total={Math.ceil(album.tracks.total / limit)}
          select={setPage}
        />
      }

      {/* songs */}
      <div className={styles.songs}>
        {(tracks.items && tracks.items.length != 0) && <>
          <div className={styles.song}>
            <div className={styles.title}>Title</div>
            <div className={styles.length}>Length</div>
            <div className={styles.actions}>Actions</div>
          </div>
          {tracks.items.map((song, index) => {
            return (
              <div className={styles.song} key={index}>
                <div className={styles.title}>
                  {song.name}
                    {filterArtists(song.artists).map((artist, index) => {
                      return (
                        <span key={index} className={styles.extraArtists}>
                          {index == 0  ? ' - ' : ''}
                          {index > 0 ? ', ' : ''}
                            <a onClick={() => props.select(artist)}>
                              {artist.name}
                            </a>
                        </span>
                      )
                    })}
                </div>
                <div className={styles.length}>{formatLengthMs(song.duration_ms)}</div>
                <div className={styles.actions}>
                  <AudioPlayer 
                    url={song.preview_url}
                    isPlaying={playing}
                    updatePlaying={(val) => setPlaying(val)}
                  />
                  <ActionIcon
                    icon="add"
                    onClick={() => props.addSong(song)}
                    isError={props.isError}
                    inPlaylist={song.inPlaylist}
                  />
                </div>
              </div>
            )
          })}
        </>}
      </div>
      {/* pagination */}
      {album &&
        <PaginationIndex
          currentPage={page}
          total={Math.ceil(album.tracks.total / limit)}
          select={setPage}
        />
      }
    </div>
  )
}