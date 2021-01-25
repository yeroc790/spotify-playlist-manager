import SearchBar from './searchBar'
import AlbumCard from './albumCard'
import AudioPlayer from './audioPlayer'
import styles from '../styles/Search.module.css'
import { useState, useEffect } from 'react'
import { fetchPath, formatLengthMs, formatDate } from '../lib/utils'

export default function Search(props) {
  const [tracks, setTracks] = useState('')
  const [artists, setArtists] = useState('')
  const [albums, setAlbums] = useState('')
  const [results, setResults] = useState()
  const [playing, setPlaying] = useState(false)

  // on input change
  useEffect(() => {
    if (!props.input) {
      clearResults()
      return
    }
    loadResults()
  }, [props.input])

  // on results change
  useEffect(() => {
    if (!results || !props.input) {
      clearResults()
      return
    }
    if (results.tracks && results.tracks.items.length != 0) {
      setTracks(results.tracks.items)
    }
    if (results.artists && results.artists.items.length != 0) {
      setArtists(results.artists.items)
    }
    if (results.albums && results.albums.items.length != 0) {
      setAlbums(results.albums.items)
    }
  }, [results])

  // on type change
  useEffect(() => {
    loadResults()
  }, [props.type])

  const loadResults = () => {
    if (!props.input) return
    let input = encodeURIComponent(props.input)
    let path = 'http://localhost:3000/api/spotify/search/' + input + '/' + props.type
    fetchPath(path).then(data => {
      data && setResults(data)
    })
  }

  // clears all hooks by default, or ones passed in array
  const clearResults = (arr) => {
    if (!arr) arr = ['artist', 'track', 'album']
    arr.forEach(a => {
      if (a == 'artist') setArtists('')
      if (a == 'track') setTracks('')
      if (a == 'album') setAlbums('')
    })
  }

  const selectType = (x) => {
    if (x == 'artist') clearResults(['track', 'album'])
    if (x == 'track') clearResults(['artist', 'album'])
    if (x == 'album') clearResults(['artist', 'track'])
    props.updateType(x)
  }

  return (
    <div className={styles.container}>
      <div className={styles.searchBar}>
        <SearchBar
          keyword={props.input}
          setKeyword={props.updateInput}
        />
        <div className={styles.iconList}>
          <i
            className={`${styles.icon} ${props.type == 'artist' ? styles.active : ''} material-icons`}
            onClick={() => selectType('artist')}
          >person</i>
          <i
            className={`${styles.icon} ${props.type == 'track' ? styles.active : ''} material-icons`}
            onClick={() => selectType('track')}
          >music_note</i>
          <i
            className={`${styles.icon} ${props.type == 'album' ? styles.active : ''} material-icons`}
            onClick={() => selectType('album')}
          >album</i>
        </div>
      </div>
      
      <div className={styles.results}>
        {/* artists */}
        {artists && <>
          {/* <p className={styles.sectionTitle}>Artists</p> */}
          <div className={styles.artists}>
            {
              artists.map((artist) => {
                let imgUrl = '/Portrait_Placeholder.png'
                if (artist.images.length != 0) {
                  if (artist.images[2] && artist.images[2].url)
                    imgUrl = artist.images[2].url
                  else if (artist.images[0] && artist.images[0].url) 
                    imgUrl = artist.images[0].url
                }
                return (
                  <div
                    className={styles.artist}
                    key={artist.id}
                    onClick={() => props.select(artist)}
                  >
                    <img
                      src={imgUrl}
                      className={styles.artistImg}
                    />
                    <div className={styles.artistName}>
                      {artist.name}
                    </div>
                  </div>
                )
              })
            }
          </div>
        </>}
        {/* tracks */}
        {tracks && <>
          {/* <p className={styles.sectionTitle}>Songs</p> */}
          <div className={styles.tracks}>
            <div className={styles.track}>
              <div className={styles.title}>Title</div>
              <div className={styles.artist}>Artist</div>
              <div className={styles.album}>Album</div>
              <div className={styles.length}>Length</div>
              <div className={styles.actions}>Actions</div>
            </div>
            {
              tracks.map((track) => {
                return (
                  <div className={styles.track} key={track.id}>
                    <div className={styles.title}>{track.name}</div>
                    <div className={styles.artist}>
                      {track.artists.map((artist, index) => {
                        return (<span key={artist.id}>
                          {index == 0 ? '' : ', '}
                          <a onClick={() => props.select(artist)}>
                            {artist.name}
                          </a>
                        </span>)
                      })}
                    </div>
                    <div className={styles.album}>
                      <a onClick={() => props.select(track.album)}>
                        {track.album.name}
                      </a>
                    </div>
                    <div className={styles.length}>{formatLengthMs(track.duration_ms)}</div>
                    <div className={styles.actions}>
                      <AudioPlayer 
                        url={track.preview_url}
                        isPlaying={playing}
                        updatePlaying={(val) => setPlaying(val)}
                      />
                      <i 
                        className={`${styles.icon} material-icons`}
                        onClick={() => props.addSong(track)}
                        >add</i>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </>}
        {/* albums */}
        {albums && <>
          {/* <p className={styles.sectionTitle}>Albums</p> */}
          <div className={styles.albums}>
            {
              albums.map((album) => {
                return (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    select={(album) => props.select(album)}
                    addAlbum={(album) => props.addAlbum(album)}
                    showArtist={true}
                  />
                )
              })
            }
          </div>
        </>}
      </div>
    </div>
  )
}