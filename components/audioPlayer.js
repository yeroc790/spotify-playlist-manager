// https://stackoverflow.com/questions/47686345/playing-sound-in-react-js
import { useState, useEffect } from 'react'
import styles from '../styles/AudioPlayer.module.css'

const useAudio = url => {
  if (!url) return [undefined, undefined]
  const [audio] = useState(new Audio(url))
  const [playing, setPlaying] = useState(false)

  const toggle = () => setPlaying(!playing)

  useEffect(() => {
    playing ? audio.play() : audio.pause()

    // if still playing on unmount, stop
    return () => {
      if (playing) {
        setPlaying(false)
      }
    }
  }, [playing])

  useEffect(() => {
    audio.addEventListener('ended', () => setPlaying(false))
    return () => {
      audio.pause()
      audio.removeEventListener('ended', () => setPlaying(false))
    }
  }, [])

  return [playing, toggle]
}

const Player = ({ url, refresh }) => {
  const [playing, toggle] = useAudio(url)

  // stop audio if refresh prop changes
  useEffect(() => {
    return () => {
      if (playing) {
        toggle()
      }
    }
  }, [refresh])

  return (<>
    <i
        className={
          `material-icons 
          ${styles.icon} 
          ${playing == undefined ? styles.inactive : ''}
        `}
        onClick={playing == undefined ? () => {} : () => toggle()}
      >{playing ? 'stop' : 'play_circle_outline'}</i>
  </>)
}

export default Player