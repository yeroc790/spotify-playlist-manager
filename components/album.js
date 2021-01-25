import styles from '../styles/Album.module.css'
import AudioPlayer from '../components/audioPlayer'
import ActionIcon from '../components/actionIcon'
import Image from './image'
import { formatLengthMs, isEmptyObject, fetchPath } from '../lib/utils'
import { useState, useEffect } from 'react'

const url = 'http://localhost:3000/api/spotify/album/'

export default function Albums(props) {
  const [album, setAlbum] = useState({})
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    loadData()
  }, [props.savedTracks])

  // takes album object and formats it
  const parseTracks = (data) => {
    if (!data.tracks) return data

    // set inPlaylist property for each track
    let items = data.tracks.items.map(track => {
      // if (props.savedTracks.indexOf(track.uri) != -1)
      if (props.savedTracks.has(track.uri))
        track.inPlaylist = true
      else track.inPlaylist = false
      return track
    })
    data.tracks.items = items
    setAlbum(data)
    console.log('got album: ', album)
  }
  
  const loadData = () => {
    let path = url + props.albumID
    fetchPath(path).then(data => {
      data && parseTracks(data)
    }).catch(error => {
      console.log('Error fetching album: ', error)
      return <div className="message">Error fetching album</div>
    })
  }

  const filterArtists = (artists) => {
    let arr = artists.filter(artist => {
      if (artist.name == album.artists[0].name) return
      return artist
    })
    return arr
  }
  
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

      {/* songs */}
      <div className={styles.songs}>
        {(album.tracks && album.tracks.items) && <>
          <div className={styles.song}>
            <div className={styles.title}>Title</div>
            <div className={styles.length}>Length</div>
            <div className={styles.actions}>Actions</div>
          </div>
          {album.tracks.items.map((song, index) => {
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
    </div>
  )
}