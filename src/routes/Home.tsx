import { useState, useEffect } from 'react';
import Post from './Post';
import { List } from 'antd-mobile';
import { createRandomPosts, PostServiceIns } from '../storage/posts';

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        await createRandomPosts(PostServiceIns, 20);
        const allPosts = await PostServiceIns.getAllPosts();
        setPosts(allPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return <div style={{ padding: 16 }}>加载中...</div>;
  }

  return (
    <List>
      {posts.map((post) => (
        <List.Item key={post.id}>
          <Post post={post} />
        </List.Item>
      ))}
    </List>
  );
}