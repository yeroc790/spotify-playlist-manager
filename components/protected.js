import Link from 'next/link'
import { useSession } from 'next-auth/client'
import styles from '../styles/Home.module.css'

export default function Protected({ children }) {
  const [ session, loading ] = useSession()

  if (loading) {
    return <p className="message">Loading...</p>
  }

  if (!session) {
    return (
      <div className={styles.container}>
        <main className={styles.main}>
          <div>
            <h2 className={styles.title}>Unauthorized Access</h2>
          </div>
          <div>
            <p className={styles.description}>
              <Link href="/"><a>Back to Home</a></Link>
            </p>
          </div>
        </main>
      </div>
    )
  }
  return (
    <div>
      {children}
    </div>
  )
}