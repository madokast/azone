import { type Post as PostType } from '../services/posts';
import { useEffect, useState } from 'react';

import { Button, Image, Space } from 'antd-mobile';
import { Attachment, AttachmentServiceIns } from '../services/attachments';
import AttachmentViewer from './AttachmentViewer';
import { showToast } from './toast';

interface PostProps {
  post: PostType;
  imageSize?: string;
}

export default function Post({ post, imageSize = "90px" }: PostProps) {

  // 控制内容和附件的显示/折叠
  const collapseContentSize = 100;
  const collapseAttachmentSize = 3;
  const [expanded, setExpanded] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  useEffect(() => {
    if (post.attachmentIds && post.attachmentIds.length > 0) {
      AttachmentServiceIns.getAttachments(post.attachmentIds)
        .then(setAttachments)
        .catch((error) => showToast(`${error}`));
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

  // 控制附件查看器的显示/隐藏
  const [attachmentViewerVisible, setAttachmentViewerVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div style={{ margin: 0 }}>
      {/* 内容 */}
      <p>{displayContent}</p>
      
      {/* 附件 */}
      {attachments.length > 0 && (
        <Space wrap>
          {displayAttachments.map((attachment, index) => (
            <Image
              key={attachment.id}
              src={attachment.thumbnailUrl}
              width={imageSize}
              height={imageSize}
              fit='cover'
              onClick={() => {
                setCurrentIndex(index);
                setAttachmentViewerVisible(true);
              }}
            />
          ))}
        </Space>
      )}
      
      {/* 元信息 */}
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

      <AttachmentViewer
        attachments={attachments}
        visible={attachmentViewerVisible}
        currentIndex={currentIndex}
        onClose={() => setAttachmentViewerVisible(false)}
      />
    </div>
  );
}