import { type Post as PostType } from '../storage/posts';
import { useState } from 'react';

interface PostProps {
  post: PostType;
}

export default function Post({ post }: PostProps) {
  const collapseSize = 100;
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ margin: 0 }}>
      <p>
        {expanded ? post.content : `${post.content.slice(0, collapseSize)}...`}
      </p>
      <div style={{ fontSize: 12, color: '#6e6e6e' }} className='no-select'>
        {post.createdAt}
        <span>{" "}</span>
        <span hidden={post.content.length <= collapseSize} onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
          {expanded ? 'Show Less' : 'Show More'}
        </span>
      </div>
    </div>
  );
}