import '../styles/globals.css'
import { Provider } from 'next-auth/client'
import { SWRConfig } from 'swr'
import axios from 'axios'

function MyApp({ Component, pageProps }) {
  return (
    <Provider session={pageProps.session}>
      <SWRConfig value={{fetcher: (url) => axios(url).then(r => r.data)}}>
        <Component {...pageProps} />
      </SWRConfig>
    </Provider>
  )
}

export default MyApp
