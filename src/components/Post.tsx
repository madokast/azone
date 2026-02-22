import { type Post as PostType } from '../storage/posts';
import { useState } from 'react';

import { Button } from 'antd-mobile';

interface PostProps {
  post: PostType;
}

export default function Post({ post }: PostProps) {
  const collapseSize = 100;
  const shouldCollapse = post.content.length > collapseSize;
  const [expanded, setExpanded] = useState(false);

  return (
    <div style={{ margin: 0 }}>
      <p>
        {shouldCollapse && !expanded ? `${post.content.slice(0, collapseSize)}...` : post.content}
      </p>
      <div style={{ fontSize: 12, color: '#6e6e6e' }} className='no-select'>
        {post.createdAt}
        <span>{" "}</span>
        <Button size='mini' color='primary' fill='none' disabled={!shouldCollapse} onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Collapse' : 'Expand'}
        </Button>
      </div>
    </div>
  );
}