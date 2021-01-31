import styles from '../styles/PaginationIndex.module.css'
import moment from 'moment'

export default function PaginationIndex ({ currentPage=1, total=null, select=()=>null }) {
  const pages = Array.from({length: total}, (_, i) => i+1)
  const n = 2 // number of pages ahead and behind current page to show

  const pageSelected = (x) => {
    if (x >= 1 && x <= total) select(x)
  }

  if (total == 1) return null
  return (
    <div className={styles.container}>
      {pages.map(x => {
        let link = (
          <a
            className={`${styles.pageLink} ${currentPage == x ? styles.currentPage : ''}`}
            onClick={() => pageSelected(x)}
          >{x}</a>
        )
        let dots = (<span className={styles.dots}>. . .</span>)
        if (x == 1 || x == total) return link
        return (<span key={`a${x}`}>
          {(x == (currentPage - n - 1)) && dots}
          {(x >= (currentPage - n) && x <= (currentPage + n)) && link}    
          {(x == (currentPage + n + 1)) && dots}
        </span>)
      })}
    </div>
  )
}