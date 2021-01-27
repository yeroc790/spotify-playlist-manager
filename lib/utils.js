import React from 'react'
import moment from 'moment'

export function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

export function objToJSON(obj) {
  if (!obj) return obj;
  if (isEmptyObject(obj)) return obj;
  return JSON.parse(JSON.stringify(obj));
}

// adds incrementing IDs to array of objects
export function addID(arr) {
  let i = 0
  return arr.map(a => {
    a.id = i
    i++
    return a
  })
}

// https://www.digitalocean.com/community/tutorials/creating-a-custom-usefetch-react-hook
export const useFetch = (url, options) => {
  const [response, setResponse] = React.useState(null);
  const [error, setError] = React.useState(null);
  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(url, options);
        const json = await res.json();
        setResponse(json);
      } catch (error) {
        setError(error);
      }
    };
    fetchData();
  }, []);
  return { response, error };
};

// https://stackoverflow.com/questions/58890534/react-how-do-i-get-fetched-data-outside-of-an-async-function
// not working for error handling, need to deprecate usage of this function
export async function fetchPath (path) {
  try {
    const result = await fetch(path, {
      method: "GET"
    })

    return await result.json()
  } catch (err) {
    // console.log(err)
    // return null
    console.log('error in fetch path: ', err)
    throw err
  }
}

export async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json'
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  }).catch(error => {
    console.log('error: ', error)
  })
  return response.json(); // parses JSON response into native JavaScript objects
}

// converts length from ms to mm:ss
export const formatLengthMs = (length) => {
  let date = new Date(length)
  return date.toLocaleTimeString([], { minute: 'numeric', second: '2-digit'})
}

export const dateToDays = (dateStr) => {
  return moment(dateStr).fromNow()
}

export const formatDate = (dateStr) => {
  return moment(dateStr).format('M/DD/YYYY')
}

// takes set of track objects, returns set of strings
export const generateUriSet = (tracks) => {
  if (tracks.length == 0) return new Set()
  return new Set(tracks.map(obj => { return obj.track.uri }))
}

// compares a string array against another string array and removes duplicates
export const removeDuplicates = (arr, compare) => {
  return arr.filter(x => !compare.includes(x))
}