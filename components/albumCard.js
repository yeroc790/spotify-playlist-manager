import styles from '../styles/AlbumCard.module.css'
import Tooltip from '@material-ui/core/Tooltip'
import ActionIcon from './actionIcon'
import moment from 'moment'

const formatDate = (dateStr) => {
  return moment(dateStr).format('MMM DD, YYYY')
}

export default function AlbumCard (props) {

  // suppresses wrapper onClick event (select())
  const addAlbum = (e, album) => {
    if (!e) e = window.event
    e.cancelBubble = true
    if (e.stopPropagation) e.stopPropagation()
    props.addAlbum(album)
  }

  // suppresses wrapper onClick event
  const selectArtist = (e, artist) => {
    if (!e) e = window.event
    e.cancelBubble = true
    if (e.stopPropagation) e.stopPropagation()
    props.select(artist)
  }

  return (
    <div
      key={props.album.id}
      className={styles.album}
      onClick={() => props.select(props.album)}
    >
      <img src={props.album.images[1].url} />
      <div className={styles.albumDesc}>
        <p className={styles.albumName}>{props.album.name}</p>
        {props.showArtist &&
          <p className={styles.artistName}>
            {props.album.artists.map((artist, index) => {
              return (
                <span key={index}>
                  {index > 0 ? ', ' : ''}
                  <a onClick={(e) => selectArtist(e, artist)}>
                    {artist.name}
                  </a>
                </span>
              )
            })}
          </p>
        }
        <p>{formatDate(props.album.release_date)}</p>
      </div>
      <div className={styles.iconContainer}>
        {/* <Tooltip
          id="album-tooltip"
          title="Add to playlist"
          placement="top"
        > */}
          {/* <i 
            className={`${styles.icon} material-icons`}
            onClick={(e) => addAlbum(e, props.album)}
          >add</i> */}
          <ActionIcon
            icon="add"
            onClick={(e) => addAlbum(e, props.album)}
            isError={props.isError}
          />
        {/* </Tooltip> */}
      </div>
    </div>
  )
}