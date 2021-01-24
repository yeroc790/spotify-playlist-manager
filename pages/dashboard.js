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
  const [urisInPlaylist, setUrisInPlaylist] = useState(new Set()) // holds array of song uris for checking to see if song is in playlist

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [selected])

  // clear message
  useEffect(() => {
    if (!message) return
    setTimeout(() => {
      setMessage('')
      setTimeout(() => {
        setError(false)
      }, 100);
    }, 2000);
  }, [message])

  const select = (obj) => {
    // console.log('selected ' + obj.type + ': ', obj)
    if (obj.type != 'playlist') {
      let arr = history
      arr.push({
        view: view,
        selected: selected
      })
      setHistory(history)
    } else {
      setPlaylist(obj)
      clearExtraStates()

      // on playlist select, fetch uris
      // note: not running this on [playlist] change because back() also triggers that
      // and i only want to run this once as it's fetching everything
      fetchAllUris(obj.tracks.total, obj.id)
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
    setUrisInPlaylist(new Set())
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

  // on playlist select, fetches all songs and stores the uris in urisInPlaylist Set
  const fetchAllUris = async (total, id) => {
    let totalPages = Math.ceil(total/100)

    let uris = new Set()
    let res
    let offset
    for (let i=0; i < totalPages; i++) {
      offset = i*100
      res = await axios.get('/api/spotify/playlists/' + id, { params: { uris: true, offset: offset }})
      res.data.items.map(item => {
        uris.add(item.track.uri)
      })
    }
    setUrisInPlaylist(uris)
  }

  const addAlbum = async (album) => {
    // console.log('adding album to playlist: ', album)
    
    try {
      // get tracks in album
      let res = await axios.get('/api/spotify/album/' + album.id, { data: {tracks: true}})

      // generate array of track uris
      // filter out tracks already in playlist
      let arr = res.data.tracks.items.map(track => {
        if (!urisInPlaylist.has(track.uri))
          return track.uri
      }).filter(x => x !== undefined)

      if (arr.length == 0) {
        setMessage('Album is already in playlist')
        return
      }

      let diff = res.data.tracks.items.length - arr.length
      console.log('Filtered out ' + diff)

      let data = {
        playlistId: playlist.id,
        songs: arr
      }
      axios({
        method: 'post',
        url: '/api/spotify/add/song',
        data: data
      }).then(() => {
        if (res.data.tracks.items.length == arr.length) 
          setMessage('Added ' + album.name + ' to ' + playlist.name)
        else
          setMessage('Added ' + arr.length + ' songs from ' + album.name + ' to ' + playlist.name)

        // append songs to urisInPlaylist
        let uris = new Set(urisInPlaylist)
        uris.add(arr)
        setUrisInPlaylist(uris)
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
    // console.log('adding ' + song.name + ' to ' + playlist.name)
    
    if (urisInPlaylist.has(song.uri)) {
      console.log('song already in playlist')
      return
    }

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

      // update urisInPlaylist
      let uris = new Set(urisInPlaylist)
      uris.add(song.uri)
      setUrisInPlaylist(uris)
    }).catch((err) => {
      console.log('error adding song to playlist: ', err)
      setError(true)
      setMessage('Error adding song to playlist')
    })
  }

  const updateUrisInPlaylist = (uris) => {
    setUrisInPlaylist(uris)
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
                  removeSong={(song, index, snapshotId) => removeSong(song, index, snapshotId)}
                  removeAlbum={(album, snapshotId) => removeAlbum(album, snapshotId)}
                  urisInPlaylist={urisInPlaylist}
                  updateUrisInPlaylist={(tracks) => updateUrisInPlaylist(tracks)}
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
                  addSong={(song, album) => addSong(song, album)}
                  select={(artist) => select(artist)}
                  isError={error}
                  savedTracks={urisInPlaylist}
                />
              </>}
            </div>
          </main>
        </div>
      </Layout>
    </Protected>
  )
}