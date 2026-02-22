import { useState, useEffect } from 'react';
import Post from '../components/Post';
import { List, InfiniteScroll, Button, Popup } from 'antd-mobile';
import { createRandomPosts, PostServiceIns, type Post as PostType } from '../storage/posts';
import Publish from '../components/Publish';

export default function Home() {
  const [data, setData] = useState<PostType[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        await createRandomPosts(PostServiceIns, 20, 256);
        const initialPosts = await PostServiceIns.getPosts(1, pageSize);
        setData(initialPosts);
        setHasMore(initialPosts.length === pageSize);
      } catch (error) {
        console.error('Error fetching initial posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialPosts();
  }, []);

  async function loadMore() {
    if (loading) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const morePosts = await PostServiceIns.getPosts(nextPage, pageSize);
      setData(val => [...val, ...morePosts]);
      setHasMore(morePosts.length === pageSize);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoading(false);
    }
  }

  // publish popup
  const [publishVisible, setPublishVisible] = useState(false);

  return (
    <>
      <List>
        {data.map((post) => (
          <List.Item key={post.id}>
            <Post post={post} />
          </List.Item>
        ))}
      </List>
      <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />

      <div style={{
        position: 'fixed',
        bottom: 100,
        right: 100,
      }} hidden={publishVisible}>
        <Button
          color='primary'
          fill='outline'
          onClick={() => setPublishVisible(true)}
        >
          Post
        </Button>
      </div>

      <Popup
        visible={publishVisible}
        onMaskClick={() => setPublishVisible(false)}
        position='bottom'
      >
        <Publish onPublish={(s)=>{}} />
      </Popup>

    </>
  );
}