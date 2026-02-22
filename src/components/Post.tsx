import { type Post as PostType } from '../storage/posts';
import { useEffect, useState } from 'react';

import { Button, Image, Space } from 'antd-mobile';
import { Attachment, AttachmentServiceIns } from '../storage/attachments';

interface PostProps {
  post: PostType;
}

export default function Post({ post }: PostProps) {
  const collapseContentSize = 100;
  const collapseAttachmentSize = 3;
  const [expanded, setExpanded] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (post.attachmentIds && post.attachmentIds.length > 0) {
      AttachmentServiceIns.getAttachments(post.attachmentIds).then(setAttachments);
    }
  }, [post.attachmentIds]);

  const shouldCollapseContent = post.content.length > collapseContentSize;
  const shouldCollapseAttachment = attachments.length > collapseAttachmentSize;
  const shouldShowExpandButton = shouldCollapseContent || shouldCollapseAttachment;

  const displayContent = shouldCollapseContent && !expanded 
    ? `${post.content.slice(0, collapseContentSize)}...` 
    : post.content;

  const displayAttachments = shouldCollapseAttachment && !expanded 
    ? attachments.slice(0, collapseAttachmentSize) 
    : attachments;

  return (
    <div style={{ margin: 0 }}>
      <p>{displayContent}</p>
      
      {attachments.length > 0 && (
        <Space wrap>
          {displayAttachments.map((attachment) => (
            <Image key={attachment.id} src={attachment.thumbnailUrl} width={100} height={100} fit='cover' />
          ))}
        </Space>
      )}
      
      <div style={{ fontSize: 12, color: '#6e6e6e' }} className='no-select'>
        {post.createdAt}
        <span> </span>
        {shouldShowExpandButton && (
          <Button
            size='mini'
            color='primary'
            fill='none'
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Collapse' : 'Expand'}
          </Button>
        )}
      </div>
    </div>
  );
}