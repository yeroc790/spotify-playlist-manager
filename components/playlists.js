import styles from '../styles/Playlists.module.css'
import NewPlaylist from './newPlaylist'
import Image from './image'
import { fetchPath } from '../lib/utils'
import { useState, useEffect } from 'react'

const url = 'http://localhost:3000/api/spotify/playlists'

export default function Playlists(props) {
  const [playlists, setPlaylists] = useState()
  
  useEffect(() => {
    fetchPath(url).then(data => {
      data && setPlaylists(data)
    }).catch(error => {
      console.log('Error fetching playlists: ', error)
      return <div className="message">Error fetching playlists</div>
    })
  }, [props.refresh])
  
  if (!playlists) return <div className='message'>Loading...</div>
  return (
    <div className={styles.wrapper}>
      <div className={styles.newPlaylist}>
        <NewPlaylist addPlaylist={(info) => props.addPlaylist(info)} />
      </div>
      <div className={styles.playlists}>
        {(playlists.items && playlists.items.length > 0) && <>
          {playlists.items.map((playlist) => {
            let imgUrl = '/Portrait_Placeholder.png'
            if (playlist.images.length != 0) {
              if (playlist.images[1] && playlist.images[1].url)
                imgUrl = playlist.images[1].url
              else if (playlist.images[0] && playlist.images[0].url) 
                imgUrl = playlist.images[0].url
            }
            return (
              <div 
                key={playlist.id}
                className={styles.playlist}
                onClick={() => props.select(playlist)}
              >
                <Image images={playlist.images} />
                <div className={styles.playlistDesc}>
                  <p className={styles.playlistName}>{playlist.name}</p>
                </div>
              </div>
            )
          })}
        </>}
      </div>
    </div>
  )
}