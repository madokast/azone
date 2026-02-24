import { useState, useEffect, useRef } from 'react';
import Post from '../components/Post';
import { List, InfiniteScroll, Button, Popup } from 'antd-mobile';
import { createRandomPosts, PostServiceIns, type Post as PostType } from '../storage/posts';
import Publish from '../components/Publish';
import { AddOutline } from 'antd-mobile-icons';

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

  // post bottom and publish popup
  const [publishVisible, setPublishVisible] = useState(false);
  const lastScrollY = useRef(0);
  const [hidePostBottom, setHidePostBottom] = useState(false);
  const [postBottomOpacity, setPostBottomOpacity] = useState(1);
  useEffect(() => {
    const handleScroll = () => {
      const currScrollY = window.scrollY;
      // 当滚动方向为上时，隐藏发布按钮；否则显示
      setPostBottomOpacity(currScrollY > lastScrollY.current ? 0 : 1);
      lastScrollY.current = currScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  useEffect(() => {
    if (postBottomOpacity === 0) {
      setTimeout(() => {
        setHidePostBottom(true);
      }, 300);
    } else {
      setHidePostBottom(false);
    }
  }, [postBottomOpacity]);

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
        opacity: postBottomOpacity,
        transition: 'opacity 0.3s ease'
      }} hidden={publishVisible || hidePostBottom}>
        <Button
          color='primary'
          fill='outline'
          shape='rounded'
          onClick={() => setPublishVisible(true)}
        >
          <AddOutline />
        </Button>
      </div>

      <Popup
        visible={publishVisible}
        onMaskClick={() => setPublishVisible(false)}
        position='bottom'
      >
        <Publish onPublish={(s) => { }} />
      </Popup>

    </>
  );
}