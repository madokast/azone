import { useState, useEffect, useRef } from 'react';
import Post from '../components/Post';
import { List, InfiniteScroll, Button, Popup, Badge } from 'antd-mobile';
import { PostService, type Post as PostType } from '../services/posts';
import Publish from '../components/Publish';
import { AddOutline } from 'antd-mobile-icons';
import { showToast } from '../components/toast';
import { AttachmentService } from '../services/attachments';

type HomeProps = {
  postService: PostService;
  attachmentService: AttachmentService;
}

export default function Home({ postService, attachmentService }: HomeProps) {
  const [data, setData] = useState<PostType[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const fetchInitialPosts = async () => {
    setLoading(true);
    try {
      const initialPosts = await postService.getPosts(1, pageSize+1);
      setData(initialPosts.slice(0, pageSize));
      setHasMore(initialPosts.length > pageSize);
    } catch (error) {
      setData([]);
      setHasMore(false);
      showToast(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialPosts();
  }, []);

  async function loadMore() {
    if (loading) return;

    setLoading(true);
    try {
      const nextPage = page + 1;
      const morePosts = await postService.getPosts(nextPage, pageSize);
      setData(val => [...val, ...morePosts]);
      setHasMore(morePosts.length === pageSize);
      setPage(nextPage);
    } catch (error) {
      console.error('Error loading more posts:', error);
    } finally {
      setLoading(false);
    }
  }

  // 发布按钮及其弹窗
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

  // 按钮显示未发布信息长度
  const [postLength, setPostLength] = useState(0);


  return (
    <>
      <List>
        {data.map((post) => (
          <List.Item key={post.id}>
            <Post post={post} attachmentService={attachmentService} />
          </List.Item>
        ))}
      </List>
      <InfiniteScroll loadMore={loadMore} hasMore={hasMore} />

      <div style={{
        position: 'fixed',
        bottom: 100,
        right: 100,
        opacity: postBottomOpacity,
        transition: 'opacity 1s ease'
      }} hidden={publishVisible || hidePostBottom}>
        <Button
          color='primary'
          fill='none'
          shape='rounded'
          onClick={() => setPublishVisible(true)}
        >
          <Badge content={postLength > 0 ? postLength : undefined}>
          <AddOutline />
          </Badge>
        </Button>
      </div>

      <Popup
        visible={publishVisible}
        onMaskClick={() => setPublishVisible(false)}
        position='bottom'
      >
        <Publish 
        onPublish={async (post) => {
          await postService.createPost(post).then(() => {
            showToast('Published');
          }).catch((error) => {
            showToast(`${error}`);
          });
          setPublishVisible(false);
          fetchInitialPosts();
        }}
        onChange={({ content }) => setPostLength(content.length)}
        focus={publishVisible} />
      </Popup>

    </>
  );
}