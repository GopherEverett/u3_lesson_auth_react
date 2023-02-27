import { useEffect, useState } from 'react'
import { GetPosts } from '../services/PostServices'

const Feed = () => {
  const [posts, setPosts] = useState([])
  
  useEffect(() => {
    const handlePosts = async () => {
      const data = await GetPosts()
      setPosts(data)
    }
    handlePosts()
  }, [])
  
  return (
    <div className="grid col-4">
      {posts.map((post) => (
        <div className="card" key={post.id}>
          <h3>{post.title}</h3>
          <div>
            <img src={post.image} alt="post"/>
          </div>
          <p>{post.body.substring(0, 80)}...</p>
        </div>
      ))}
    </div>
  )
}

export default Feed
