# About

This is a simple NextJS web application for managing Spotify playlists in bulk. For security reasons, I have limited the application to only running in developer mode, but if anyone would like to expand this project to a web application for a dedicated web server, feel free.

# Setup

Make sure you have [NodeJS](https://nodejs.org/en/download/) installed.

Clone this repository to your own computer by entering the following commands  
`git clone https://github.com/yeroc790/spotify-playlist-manager`  
`cd ./spotify-playlist-manager`  
`npm install`

After doing this, go to [Spotify's Developer Dashboard](https://developer.spotify.com/dashboard/login) and create a new app.
After completing setup you should have a Client ID and a Client Secret. Add these to the file named `.env.local`.
You also need to generate a random string with no special characters to use for the STATE variable in the .env file.

Finally, click "Edit Settings" on your Spotify Dashboard for your new app, and `http://localhost:3000/api/auth/callback/spotify` under Redirect URIs.

At this point, setup should be complete, and you can start your application by running
`npm run dev`
