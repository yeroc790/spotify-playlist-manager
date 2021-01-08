import styles from '../styles/AlertBanner.module.css'

export default function AlertBanner({ message, isErr }) {
  return (
    <div className={`${(isErr ? styles.error : styles.success)} ${styles.alert}`}>{message}</div>
  )
}