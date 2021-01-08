export default function Image ({ images }) {
  let imgUrl = '/Portrait_Placeholder.png'
  if (images.length != 0) {
    if (images[1] && images[1].url)
      imgUrl = images[1].url
    else if (images[0] && images[0].url) 
      imgUrl = images[0].url
  }
  return <img src={imgUrl} />
}