import styles from '../styles/Playlist.module.css'
import AudioPlayer from '../components/audioPlayer'
import Image from './image'
import { formatLengthMs, formatDate } from '../lib/utils'
import { fetchPath, isEmptyObject } from '../lib/utils'
import { useState, useEffect } from 'react'

const url = 'http://localhost:3000/api/spotify/playlists/'

export default function Playlists(props) {
  const [playlist, setPlaylist] = useState({})
  
  let path = url + props.playlistID
  useEffect(() => {
    fetchPath(path).then(data => {
      data && setPlaylist(data)
    }).catch(error => {
      console.log('Error fetching playlist: ', error)
      return <div className="message">Error fetching playlist</div>
    })
  }, [props.refresh])

  let showTracks = true
  if (!(playlist.tracks && playlist.tracks.items && playlist.tracks.items.length > 0)) {
    showTracks = false
  }

  if (isEmptyObject(playlist)) return <div className="message">Loading...</div>
  return (
    <div className={styles.container}>
      {/* image */}
      {playlist.images &&
        <div className="pageImg">
          <Image images={playlist.images} />
        </div>
      }
      {/* description */}
      {playlist.description && <>
        <p className={styles.description}>{playlist.description}</p>
      </>}
      {/* songs */}
      <div className={styles.songs}>
        {!showTracks && <p className="smallMessage">This playlist is empty, click the search icon to get started!</p>}
        {showTracks && <>
          <div className={styles.song}>
            <div className={styles.title}>Title</div>
            <div className={styles.artist}>Artist</div>
            <div className={styles.album}>Album</div>
            <div className={styles.length}>Length</div>
            <div className={styles.date}>Date Added</div>
            <div className={styles.actions}>Actions</div>
          </div>
          {playlist.tracks.items.map((song, songIndex) => {
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
                <div className={styles.date}>{formatDate(song.added_at)}</div>
                <div className={styles.actions}>
                  <AudioPlayer url={song.track.preview_url} />
                  <i 
                    className={`${styles.icon} material-icons ${styles.remove}`}
                    onClick={() => props.removeSong(song.track, songIndex)}
                    >delete</i>
                </div>
              </div>
            )
          })}
        </>}
      </div>
    </div>
  )
}