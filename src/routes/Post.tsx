import { useState, useEffect } from 'react';
import { PostServiceIns } from '../storage/posts';
import { showToast } from '../components/toast';

interface PostProps {
  id: string;
}

export default function Post({ id }: PostProps) {
  const [content, setContent] = useState('加载中...');
  const [createdAt, setCreatedAt] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      const post = await PostServiceIns.getPost(id);
      if (!post) {
        const errorMessage = `Post with ID ${id} not found`;
        setContent(`Error: ${errorMessage}`);
        setCreatedAt('');
        showToast(errorMessage);
        return;
      }
      setContent(post.content);
      setCreatedAt(post.createdAt);
    };

    fetchPost();
  }, [id]);

  return (
    <div style={{ margin: 0 }}>
      <p 
        style={{ 
          fontSize: 14, 
          lineHeight: 1.4, 
          marginBottom: 8,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {content}
      </p>
      <div style={{ fontSize: 12, color: '#6e6e6e' }}>
        {createdAt}
      </div>
    </div>
  );
}