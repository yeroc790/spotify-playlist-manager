import Link from 'next/link'
import Layout from '../components/layout'
import styles from '../styles/Home.module.css'
import { getLoginURL } from '../lib/spotifyApi'
import { signIn, useSession } from 'next-auth/client'

export async function getStaticProps() {
  const loginURL = getLoginURL()

  return {
    props: {
      loginURL
    }
  }
}

export default function Home({ loginURL }) {
  const [ session, loading ] = useSession()

  if (loading) {
    return <p>Loading...</p>
  }

  const foo = () => {
    console.log('foo')
  }

  return (
    <Layout>
      <div className={styles.container}>
        <main className={styles.main}>
          <h1 className={styles.title}>
            Welcome to <a href="https://github.com/yeroc790/spotify-playlist-manager">Spotify Playlist Manager!</a>
          </h1>

          {!session && <>
            <p className={styles.description}>
              Get started by <a href={loginURL}>signing in to Spotify</a>
            </p>
          </>}

          {session && <>
            <p className={styles.description}>
              Signed in as {session.user.display_name}. <Link href="/dashboard">Go to dashboard</Link> to get started!
            </p>
          </>}

          <div className={styles.grid}>
            <div className={styles.card}>
              <h3>Edit playlists in bulk</h3>
              <p>Easily add multiple songs or entire albums to a playlist.</p>
            </div>
            <div className={styles.card}>
              <h3>Explore genres</h3>
              <p>Browse songs by genre to quickly create playlists for any mood.</p>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  )
}
