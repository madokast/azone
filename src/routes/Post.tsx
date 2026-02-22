import { type Post as PostType } from '../storage/posts';

interface PostProps {
  post: PostType;
}

export default function Post({ post }: PostProps) {
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
        {post.content}
      </p>
      <div style={{ fontSize: 12, color: '#6e6e6e' }}>
        {post.createdAt}
      </div>
    </div>
  );
}