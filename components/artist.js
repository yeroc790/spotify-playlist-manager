import styles from '../styles/Artist.module.css'
import Image from './image'
import AlbumCard from './albumCard'
import ActionIcon from './actionIcon'
import PaginationIndex from './paginationIndex'
import { useState, useEffect } from 'react'
import { isEmptyObject } from '../lib/utils'
import axios from 'axios'

export default function Artist(props) {
  const artistUrl = 'http://localhost:3000/api/spotify/artist/' + props.artistID
  const albumsUrl = 'http://localhost:3000/api/spotify/artist/albums/' + props.artistID
  const limit = 20

  const [artist, setArtist] = useState({})
  const [albums, setAlbums] = useState({})
  const [errMsg, setErrMsg] = useState('')
  const [page, setPage] = useState(1)

  useEffect(() => {
    loadArtist()
  }, [])

  useEffect(() => {
    loadAlbums()
  }, [page])

  const loadArtist = async () => {
    try {
      let res = await axios.get(artistUrl)
      setArtist(res.data)
    } catch (error) {
      let msg = 'Error getting artist: ' + error.response.data.error.message
      console.log(msg)
      setErrMsg(msg)
    }
  }

  const loadAlbums = async () => {
    try {
      let offset = (page-1)*limit
      let res = await axios.get(albumsUrl, { params: { offset: offset }})
      setAlbums(res.data)
    } catch (error) {
      let msg = 'Error getting artist\'s albums: ' + error.response.data.error.message
      console.log(msg)
      setErrMsg(msg)
    }
  }

  const getGenreLink = (genre) => {
    genre = genre.replaceAll('-', '')
    genre = genre.replaceAll('/', '')
    genre = genre.replaceAll(' ', '')
    return 'http://everynoise.com/engenremap-' + genre + '.html'
  }

  const albumGroups = [
    { type: 'album', name: 'Albums'},
    { type: 'single', name: 'Singles'},
    { type: 'appears_on', name: 'Appears On'},
    { type: 'compilation', name: 'Compilations'}
  ]

  const showNext = () => {
    return (albums.total > page*limit) ? true : false
  }

  const showBack = () => {
    return (page > 1) ? true : false
  }

  const next = () => {
    if (page*limit < albums.total) {
      setPage(page+1)
    }
  }

  const back = () => {
    if (page > 1) setPage(page-1)
  }

  if (errMsg) return <div className="message">{errMsg}</div>
  if (isEmptyObject(albums) || isEmptyObject(artist)) return <div className='message'>Loading...</div>
  return (
    <div className={styles.container}>
      {artist && <>
        {/* image */}
        {artist.images &&
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
              <Image images={artist.images} />
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
        {/* genres */}
        {artist.genres && <>
          <p className={styles.genres}>
            {artist.genres.map((genre, index) => {
              return (<span key={genre}>
                {index == 0 ? '' : ', '}
                <a href={getGenreLink(genre)} target="_blank">
                  {genre}
                </a>
              </span>)
            })}
          </p>
        </>}

        {/* pagination */}
        {albums &&
          <PaginationIndex
            currentPage={page}
            total={Math.ceil(albums.total / limit)}
            select={setPage}
          />
        }

        {/* albums */}
        {albums && <>
          {albumGroups.map(group => {
            return (
              <div key={group.type}>
                {albums.items.find(album => album.album_group == group.type) && <>
                  <h3 className={styles.albumType}>{group.name}</h3>
                  <div className={styles.albums}>
                    {albums.items.map((album) => {
                      if (album.album_group != group.type) return
                      return (
                        <AlbumCard
                          key={album.id}
                          album={album}
                          select={(album) => props.select(album)}
                          addAlbum={(album) => props.addAlbum(album)}
                          showArtist={false}
                        />
                      )
                    })}
                  </div>
                </>}
              </div>
            )
          })}
        </>}

        {/* pagination */}
        {(albums && albums.items.length > 10) &&
          <PaginationIndex
            currentPage={page}
            total={Math.ceil(albums.total / limit)}
            select={setPage}
          />
        }
      </>}
    </div>
  )
}