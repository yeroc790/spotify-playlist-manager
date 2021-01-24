import styles from '../styles/ActionIcon.module.css'
import { useState, useEffect } from 'react'

export default function ActionIcon({icon, onClick, color, isError, header=null, inPlaylist=false, changeAfterClick=true, resetOnClick=false, resetTime=null}) {
  const [disabled, setDisabled] = useState(false)
  const [iconName, setIconName] = useState(icon)

  if (!color) color = '#0070f3'

  useEffect(() => {
    if (inPlaylist) {
      setDisabled(true)
      setIconName('check')
    }
  }, [inPlaylist])

  // reset icon on error
  useEffect(() => {
    if (isError) {
      console.log('error, resetting icon')
      setDisabled(false)
      setIconName(icon)
    }
  }, [isError])

  const handleClick = (e) => {
    if (disabled) return
    setDisabled(true)
    if (changeAfterClick) setIconName('check')
    onClick(e)

    if (resetOnClick) {
      setTimeout(() => {
        setDisabled(false)
      }, (resetTime ? resetTime : 2000));
    }
  }

  
  let style = {
    color: color
  }

  return (
      <i 
        className={`${disabled ? styles.disabled : ''} ${header ? styles.header : ''} ${styles.icon} material-icons`}
        style={style}
        onClick={(e) => handleClick(e)}
      >{iconName}</i>
  )
}