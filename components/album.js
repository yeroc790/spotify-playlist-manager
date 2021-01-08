import styles from '../styles/Album.module.css'
import AudioPlayer from '../components/audioPlayer'
import ActionIcon from '../components/actionIcon'
import Image from './image'
import { formatLengthMs } from '../lib/utils'
import useSWR from 'swr'

const url = 'http://localhost:3000/api/spotify/album/'

export default function Albums(props) {
  if (!props.albumID) return <div>Invalid album id</div>
  let path = url + props.albumID
  const { data: album, error } = useSWR(path)
  if (error) return <div className='message'>Error fetching album</div>
  if (!album) return <div className='message'>Loading...</div>

  const filterArtists = (artists) => {
    let arr = artists.filter(artist => {
      if (artist.name == album.artists[0].name) return
      return artist
    })
    return arr
  }

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
                  <AudioPlayer url={song.preview_url} />
                  <ActionIcon
                    icon="add"
                    onClick={() => props.addSong(song)}
                    isError={props.isError}
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