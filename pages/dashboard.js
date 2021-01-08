import { useState, useEffect } from 'react'
import Layout from '../components/layout'
import Protected from '../components/protected'
import Playlists from '../components/playlists'
import Playlist from '../components/playlist'
import Search from '../components/search'
import Artist from '../components/artist'
import Album from '../components/album'
import ActionIcon from '../components/actionIcon'
import styles from '../styles/Dashboard.module.css'
import axios from 'axios'

export default function Dashboard() {
  const [view, setView] = useState('home')
  const [selected, setSelected] = useState({})
  const [history, setHistory] = useState([])
  const [playlist, setPlaylist] = useState({})
  const [searchInput, setSearchInput] = useState('')
  const [searchType, setSearchType] = useState('artist')
  const [error, setError] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [selected])

  // clear message
  useEffect(() => {
    if (!message) return
    setTimeout(() => {
      console.log('clearing message')
      setMessage('')
      setError(false)
    }, 2000);
  }, [message])

  const select = (obj) => {
    console.log('selected ' + obj.type + ': ', obj)
    if (obj.type != 'playlist') {
      let arr = history
      arr.push({
        view: view,
        selected: selected
      })
      console.log('updating history: ', history)
      setHistory(history)
    } else {
      clearExtraStates()
      setPlaylist(obj)
    }
    setSelected(obj)
    setView(obj.type)
  }

  const viewPlaylist = () => {
    setView('playlist')
  }

  const showSearch = () => {
    setView('search')
  }

  const clearSelectedPlaylist = () => {
    setPlaylist({})
    clearExtraStates()
  }

  // clears all states except playlist
  const clearExtraStates = () => {
    setView('home')
    setSelected({})
    setHistory([])
    setSearchInput('')
    setSearchType('artist')
  }

  // passed to search component
  // input stored on dashboard to resume search after leaving view
  const updateSearchInput = (str) => {
    setSearchInput(str)
  }

  // passed to search component
  const updateSearchType = (type) => {
    setSearchType(type)
  }

  const back = () => {
    if (view == 'search' || view == 'playlist') {
      clearSelectedPlaylist()
      return
    }

    if (view == 'playlist') {
      setSearchInput('')
      setSearchType('artist')
    }
    setSearchInput(searchInput) // reload search data
    setSearchType(searchType)

    if (history.length == 0) return

    let arr = history
    let x = arr.pop()
    setView(x.view)
    setSelected(x.selected)
    setHistory(arr)
  }

  const addAlbum = async (album) => {
    console.log('adding ' + album.name + ' to ' + playlist.name)
    console.log('adding album: ', album)

    try {
      let res = await axios.get('/api/spotify/album/' + album.id, { data: {tracks: true}})
      let tracks = res.data.tracks.items
      let arr = []
      tracks.map(track => {
        arr.push(track.uri)
      })

      let data = {
        playlistId: playlist.id,
        songs: arr
      }
      
      axios({
        method: 'post',
        url: '/api/spotify/add/song',
        data: data
      }).then(() => {
        setMessage('Added ' + album.name + ' to ' + playlist.name)
      }).catch((err) => {
        console.log('error adding album to playlist: ', err)
        setError(true)
        setMessage('Error adding album to playlist')
      })
    } catch (error) {
      console.log('error: ', error)
    }
  }

  const addSong = (song) => {
    console.log('adding ' + song.name + ' to ' + playlist.name)
    let data = {
      playlistId: playlist.id,
      songs: [song.uri]
    }
    
    axios({
      method: 'post',
      url: '/api/spotify/add/song',
      data: data
    }).then(() => {
      setMessage('Added ' + song.name + ' to ' + playlist.name)
    }).catch((err) => {
      console.log('error adding song to playlist: ', err)
      setError(true)
      setMessage('Error adding song to playlist')
    })
  }

  const removeSong = (song, index) => {
    console.log('removing ' + song.name + ' from ' + playlist.name + ' at index ' + index)
    let data = {
      playlistId: playlist.id,
      snapshotId: playlist.snapshot_id,
      index: index
    }
    axios.delete('/api/spotify/remove/song', {data: data})
      .then(() => {
        setMessage('Removed ' + song.name + ' from ' + playlist.name)
        // need to somehow refresh Playlist component
      }).catch(err => {
        console.log('Error removing song from playlist: ', err)
        setError(true)
        setMessage('Error removing song from playlist')
      })
  }

  const addPlaylist = (info) => {
    if (!info || !info.name) return
    console.log('creating new playlist: ', info)
    
    axios({
      method: 'post',
      url: '/api/spotify/add/playlist',
      data: info
    }).then(() => {
      setMessage('Playlist created')
    }).catch((err) => {
      console.log('error creating playlist: ', err)
      setError(true)
      setMessage('Error creating playlist')
    })
  }

  return (
    <Protected>
      <Layout
        playlist={view == 'playlist' ? {} : playlist}
        select={(playlist) => select(playlist)}
        isErr={error}
        message={message}
      >
        <div className={styles.container}>
          <main className={styles.main}>
            <div className={styles.header}>

              {/* back arrow */}
              {!(view == 'home') &&
                <i 
                className={`${styles.icon} material-icons`}
                onClick={() => back()}
                >keyboard_arrow_left</i>
              }

              {/* title */}
              {view == 'home' &&
                <h1 className={styles.title}>Welcome to your dashboard!</h1>
              }
              {!(view == 'home') &&
                <h1 className={styles.title}>{selected.name}</h1>
              }

              {/* search/details */}
              {view == 'search' &&
                <i
                className={`${styles.icon} material-icons`}
                onClick={() => viewPlaylist()}
                >menu</i>
              }
              {view == 'playlist' &&
                <i
                className={`${styles.icon} material-icons`}
                onClick={() => showSearch()}
                >search</i>
              }
              {view == 'artist' && 
                <i className={`${styles.icon} ${styles.clear} material-icons`}>menu</i>
              }
              {view == 'album' &&
                <ActionIcon
                  className={styles.icon}
                  icon="add"
                  onClick={(e) => addAlbum(selected)}
                  isError={error}
                  header="true"
                />
              }
              {view == 'home' &&
                <p className={styles.description}>Select a playlist to get started</p>
              }
            </div>
            
            <div className={styles.content}>
              {/* Select a playlist */}
              {view == 'home' && <>
                <Playlists 
                  select={(playlist) => select(playlist)}
                  addPlaylist={(info) => addPlaylist(info)}
                  refresh={message}
                />
              </>}
              
              {/* View playlist details */}
              {view == 'playlist' && <>
                <Playlist 
                  playlistID={selected.id}
                  select={(obj) => select(obj)}
                  removeSong={(song, index) => removeSong(song, index)}
                  refresh={message}
                />
              </>}
              
              {/* View search */}
              {view == 'search' && <>
                <Search 
                  select={(obj) => select(obj)}
                  updateInput={(str) => updateSearchInput(str)}
                  updateType={(type) => updateSearchType(type)}
                  addAlbum={(album) => addAlbum(album)}
                  addSong={(song) => addSong(song)}
                  input={searchInput}
                  type={searchType}
                />
              </>}

              {/* View artist */}
              {view == 'artist' && <>
                <Artist 
                  artistID={selected.id}
                  addAlbum={(album) => addAlbum(album)}
                  select={(album) => select(album)}
                />
              </>}

              {/* View album */}
              {view == 'album' && <>
                <Album
                  albumID={selected.id}
                  addAlbum={(album) => addAlbum(album)}
                  addSong={(song) => addSong(song)}
                  select={(artist) => select(artist)}
                  isError={error}
                />
              </>}
            </div>
          </main>
        </div>
      </Layout>
    </Protected>
  )
}