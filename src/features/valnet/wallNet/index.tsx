import WallNetConfig from './WallNetConfig'
import WallNetFeed from './WallNetFeed'
import WallNetPostForm from './WallNetPostForm'

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
