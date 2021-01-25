import Head from 'next/head'
import UserInfo from './userInfo'
import Alert from '@material-ui/lab/Alert'
import Slide from '@material-ui/core/Slide'
import styles from '../styles/Layout.module.css'
import { useSession } from 'next-auth/client'
import { useState, useEffect } from 'react'

export default function Layout({ children, playlist, select, isErr, message }) {
  const [ session ] = useSession()
  const [showAlert, setShowAlert] = useState(false)

  useEffect(() => {
    if (message) setShowAlert(true)
    else setShowAlert(false)
  },[message])

  let name = ''
  if (session) {
    name = session.user.display_name
  }
  return (
    <div className={styles.container}>
      <div className={styles.alert}>
        <Slide direction="down" in={showAlert}>
          <Alert severity={isErr ? 'error' : 'success'}>{message}</Alert>
        </Slide>
      </div>
      <Head>
        <title>Spotify Playlist Manager</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <header className={styles.header}>
        <div className={styles.currentPlaylist}>
          {playlist &&
            <p>
              <a onClick={() => select(playlist)}>{playlist.name}</a>
            </p>
          }
        </div>
        <div className={styles.userInfo}>
          <UserInfo name={name} />
        </div>
      </header>
      <main>{children}</main>
      <footer className={styles.footer}>
        <p>Created by {' '}<a href="https://github.com/yeroc790">Corey Hansen</a>, 2021</p>
      </footer>
    </div>
  )
}