import { useEffect } from 'react'

export default function SearchBar ({keyword, setKeyword}) {
  return (
    <input
      key="searchbar"
      ref={input => input && input.focus()}
      autoFocus
      value={keyword}
      placeholder={"Search Spotify"}
      onChange={(e) => setKeyword(e.target.value)}
    />
  )
}