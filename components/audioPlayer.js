// https://stackoverflow.com/questions/47686345/playing-sound-in-react-js
import { useState, useEffect } from 'react'
import styles from '../styles/AudioPlayer.module.css'

const useAudio = (url, updatePlaying) => {
  if (!url) return [undefined, undefined]
  const [audio] = useState(new Audio(url))
  const [playing, setPlaying] = useState(false)

  // const toggle = () => setPlaying(!playing)
  const toggle = () => {
    if (playing) {
      // turn off
      updatePlaying(false)
      setPlaying(false)
    } else {
      // turn all audios off
      // then turn this one on
      updatePlaying(false)
      setTimeout(() => {
        setPlaying(true)
        updatePlaying(true)
      }, 100);
    }
  }

  useEffect(() => {
    playing ? audio.play() : audio.pause()

    // if still playing on unmount, stop
    return () => {
      if (playing) {
        setPlaying(false)
        updatePlaying(false)
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

const Player = ({ url, isPlaying, updatePlaying }) => {
  const [playing, toggle] = useAudio(url, updatePlaying)

  useEffect(() => {
    if (!isPlaying && playing) {
      toggle()
    }
  }, [isPlaying])

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