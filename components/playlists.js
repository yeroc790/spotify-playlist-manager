import styles from '../styles/Playlists.module.css'
import PlaylistDetails from './playlistDetails'
import ActionIcon from './actionIcon'
import PaginationIndex from './paginationIndex'
import Image from './image'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/client'
import axios from 'axios'
import Alert from '@material-ui/lab/Alert'
import Slide from '@material-ui/core/Slide'

export default function Playlists(props) {
  const [session] = useSession()
  const [playlists, setPlaylists] = useState()
  const [page, setPage] = useState(1)
  const [message, setMessage] = useState('')
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!message) return
    setTimeout(() => {
      setError(false)
      setTimeout(() => {
        setMessage('')
      })
    }, 2000);
  }, [message])

  useEffect(() => {
    loadPlaylists()
  }, [page])

  const showNext = () => {
    return (playlists.total > page*20) ? true : false
  }

  const showBack = () => {
    return (page > 1) ? true : false
  }

  const next = () => {
    if (page*20 < playlists.total) {
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
  
  const loadPlaylists = async () => {
    let res = await axios.get('/api/spotify/playlists', {params: { offset: ((page-1)*20)}})
    let arr = res.data
    setPlaylists(arr)
  }

  const addPlaylist = (info) => {
    if (!info || !info.name) return
    
    axios({
      method: 'post',
      url: '/api/spotify/add/playlist',
      data: info
    }).then(() => {
      setMessage('Playlist created')
      loadPlaylists()
    }).catch((err) => {
      console.log('error creating playlist: ', err)
      setError(true)
      setMessage('Error creating playlist')
    })
  }

  const editPlaylistInfo = (info) => {
    if (!info || !info.name) return

    axios({
      method: 'post',
      url: '/api/spotify/edit/playlist',
      data: info
    }).then(() => {
      setMessage('Playlist updated')
      loadPlaylists()
    }).catch((err) => {
      console.log('error editing playlist: ', err)
      setError(true)
      setMessage('Error editing playlist')
    })
  }

  const select = (playlist) => {
    if (playlist.owner.display_name != session.user.display_name) return
    props.select(playlist)
  }

  const currentUser = (owner) => {
    if (!session) return false
    return owner == session.user.display_name
  }
  if (!playlists) return <div className='message'>Loading...</div>
  return (
    <div className={styles.wrapper}>
      <Slide direction="down" in={message ? true : false}>
        <Alert className="alert" severity={error ? 'error' : 'success'}>{message}</Alert>
      </Slide>
      <div className={styles.newPlaylist}>
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
        <PlaylistDetails submit={(info) => addPlaylist(info)} newForm button />
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

      {/* playlists */}
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
            // skip if not owned by current user
            // if (!currentUser(playlist.owner.display_name)) return
            return (
              <div 
                key={playlist.id}
                className={`${styles.playlist} ${!currentUser(playlist.owner.display_name) ? styles.disabled : ''}`}
              >
                <div
                  className={styles.playlistInfo}
                  onClick={() => select(playlist)}
                >
                  <Image images={playlist.images} />
                  <div className={styles.playlistDesc}>
                    <p className={styles.playlistName}>{playlist.name}</p>
                  </div>
                </div>
                {currentUser(playlist.owner.display_name) && 
                  <div className={styles.iconContainer}>
                    <PlaylistDetails 
                      submit={(info) => editPlaylistInfo(info)}
                      defaultName={playlist.name}
                      defaultDesc={playlist.description}
                      defaultIsPublic={playlist.public}
                      playlistId={playlist.id}
                      icon
                    />
                  </div>
                }
              </div>
            )
          })}
        </>}
      </div>

      {/* pagination */}
      {playlists &&
        <PaginationIndex
          currentPage={page}
          total={Math.ceil(playlists.total / 20)}
          select={setPage}
        />
      }
    </div>
  )
}