import { type Post as PostType } from '../services/posts';
import { useEffect, useState } from 'react';

import { Button, Image, Space } from 'antd-mobile';
import { Attachment, MemoryAttachmentServiceIns, isImageMimeType } from '../services/attachments';
import AttachmentViewer from './AttachmentViewer';
import { showToast } from './toast';
import { unknowFileIcon, unknowPicIcon } from '../assets';

interface PostProps {
  post: PostType;
  imageSize?: string;
}

const attachmentLoadingFlag = "loading";

export default function Post({ post, imageSize = "90px" }: PostProps) {

  // 控制内容和附件的显示/折叠
  const collapseContentSize = 100;
  const collapseAttachmentSize = 3;
  const [expanded, setExpanded] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);

useEffect(() => {
  if (!post.attachments || post.attachments.length === 0) return;

  // 构造初始附件
  const initial = post.attachments.map(attachment => ({
    ...attachment,
    sourceUrl: attachmentLoadingFlag,
    thumbnailUrl: isImageMimeType(attachment.mimeType)
      ? unknowPicIcon
      : unknowFileIcon,
  } as Attachment));

  setAttachments(initial);

  // 异步加载
  initial.forEach((attachment, index) => {
    MemoryAttachmentServiceIns.getAttachment(attachment).then((loaded) => {
      setAttachments(prev =>
        prev.map((att, i) => i === index ? loaded : att)
      );
    }).catch((error) => showToast(`${error}`));
  });

}, [post.attachments]);

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
                if (attachment.sourceUrl !== attachmentLoadingFlag) {
                  setCurrentIndex(index);
                  setAttachmentViewerVisible(true);
                }
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