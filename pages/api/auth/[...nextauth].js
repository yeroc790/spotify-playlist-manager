import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'

// time in seconds, spotify default is 1 hour or 3600s
const expires = 60 * 60

const options = {
  site: process.env.NEXTAUTH_URL,
  providers: [
    Providers.Spotify({
      scope: 'playlist-read-private playlist-modify-public',
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      state: process.env.STATE
    })
  ],
  // https://github.com/nextauthjs/next-auth/discussions/871
  callbacks: {
    async jwt(prevToken, _, account, profile) {
      // Signing in
      if (account && profile) {
        return {
          accessToken: account.accessToken,
          accessTokenExpires: addSeconds(new Date(), (expires - 10)), // set initial expire time
          refreshToken: account.refreshToken,
          user: profile,
        }
      }

      // Subsequent use of JWT, the user has been logged in before
      if (new Date().toISOString() < prevToken.accessTokenExpires) {
        return prevToken
      }

      // access token has expired, try to update it
      return refreshAccessToken(prevToken)
    },
    async session(_, token) {
      return token
    },
  }
}

async function refreshAccessToken(token) {
  console.log('refreshing access token')
  try {
    const url = `https://accounts.spotify.com/api/token`
    const data = {
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: token.refreshToken
    }

    // https://github.com/github/fetch/issues/263
    const searchParams = Object.keys(data).map((key) => {
      return encodeURIComponent(key) + '=' + encodeURIComponent(data[key])
    }).join('&')

    const response = await fetch(url, {
      body: searchParams,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    })

    const refreshToken = await response.json()

    if (!response.ok) {
      throw refreshToken
    }

    // Give a 10 sec buffer
    const accessTokenExpires = addSeconds(
      new Date(),
      refreshToken.expires_in - 10
    ).toISOString()
    console.log('accessTokenExpires: ', new Date(accessTokenExpires).toLocaleTimeString('en-US'))

    return {
      ...token,
      accessToken: refreshToken.access_token,
      accessTokenExpires: accessTokenExpires,
      refreshToken: token.refreshToken,
    }
  } catch (error) {
    console.log('error refreshing: ', error)
    return {
      ...token,
      error: "RefreshAccessTokenError",
    }
  }
}

const addSeconds = (date, seconds) => {
  date.setSeconds(date.getSeconds() + seconds)
  return date
}

export default (req, res) => NextAuth(req, res, options)