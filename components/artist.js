import styles from '../styles/Artist.module.css'
import Image from './image'
import AlbumCard from './albumCard'
import useSWR from 'swr'

export default function Artist(props) {
  if (!props.artistID) return <div>Invalid artist id</div>

  const artistUrl = 'http://localhost:3000/api/spotify/artist/' + props.artistID
  const albumsUrl = 'http://localhost:3000/api/spotify/artist/albums/' + props.artistID
  const { data: artist, error: artistError } = useSWR(artistUrl)
  const { data: albums, error: albumsError} = useSWR(albumsUrl)
  if (artistError) return <div className='message'>Error fetching artist</div>
  if (!artist) return <div className='message'>Loading...</div>

  if (albumsError) return <div className='message'>Error fetching artist</div>
  if (!albums) return <div className='message'>Loading...</div>

  const albumGroups = [
    { type: 'album', name: 'Albums'},
    { type: 'single', name: 'Singles'},
    { type: 'appears_on', name: 'Appears On'},
    { type: 'compilation', name: 'Compilations'}
  ]

  const getGenreLink = (genre) => {
    genre = genre.replaceAll('-', '')
    genre = genre.replaceAll('/', '')
    genre = genre.replaceAll(' ', '')
    return 'http://everynoise.com/engenremap-' + genre + '.html'
  }

  return (
    <div className={styles.container}>
      {artist && <>
        {/* image */}
        {artist.images &&
          <div className="pageImg">
            <Image images={artist.images} />
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
      </>}
    </div>
  )
}