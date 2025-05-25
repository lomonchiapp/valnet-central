import WallNetPostForm from './WallNetPostForm'
import WallNetFeed from './WallNetFeed'
import WallNetConfig from './WallNetConfig'

const WallNet = () => {
  return (
    <div>
      <h2>WallNet - Muro Social</h2>
      <WallNetPostForm />
      <WallNetFeed />
    </div>
  )
}

export default WallNet
export { WallNetFeed, WallNetConfig } 