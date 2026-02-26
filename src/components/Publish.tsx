import { useRef, useState, useEffect } from 'react';
import { TextArea, Button, Space, Image, Grid } from 'antd-mobile';
import { TextAreaRef } from 'antd-mobile/es/components/text-area';
import { UploadOutline, PictureOutline, PlayOutline, DeleteOutline } from 'antd-mobile-icons';
import { CreatePostData } from '../services/posts';
import { Attachment } from '../services/attachments';
import { isImageMimeType } from '../services/attachments';
import AttachmentViewer from './AttachmentViewer';
import { unknowFileIcon } from '../assets';


interface PublishProps {
  onPublish: (post: CreatePostData) => void;
  onChange: (post: CreatePostData) => void;
  focus: boolean;
  imageSize?: string;
}

export default function Publish({ onPublish, onChange, focus, imageSize = "90px" }: PublishProps) {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const handlePostChange = ({ content }: CreatePostData) => {
    setContent(content);
    onChange({ content });
  };

  // 附件选择
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleMediaInput = (files: File[]) => {
    const newAttachments = files.map((file) => {
      let thumbnailUrl = unknowFileIcon;
      let sourceUrl = URL.createObjectURL(file);
      if (isImageMimeType(file.type)) {
        thumbnailUrl = sourceUrl;
      }
      return {
        id: file.name.replace(/\.[^/.]+$/, ""), // 文件名作为ID
        mimeType: file.type,
        thumbnailUrl,
        sourceUrl,
      } as Attachment;
    });
    setAttachments([...attachments, ...newAttachments]);
  };

  const handleCleanAttachment = () => {
    attachments.forEach((attachment) => URL.revokeObjectURL(attachment.sourceUrl));
    setAttachments([]);
  };

  // 控制附件查看器的显示/隐藏
  const [attachmentViewerVisible, setAttachmentViewerVisible] = useState(false);
  const [attachmentCurrentIndex, setAttachmentCurrentIndex] = useState(0);

  const handleSubmit = () => {
    if (content.trim()) {
      const publishAttachments = attachments.map((attachment) => {
        const {id, ...rest} = attachment;
        return rest;
      });
      onPublish({ content, attachments: publishAttachments });
      handlePostChange({ content: '' });
      handleCleanAttachment();
    }
  };

  // 文本区域自动聚焦
  const textAreaRef = useRef<TextAreaRef>(null);
  useEffect(() => {
    if (focus) {
      // 添加延迟确保组件完全渲染和可见
      setTimeout(() => {
        textAreaRef.current?.focus();
      }, 100);
    } else {
      textAreaRef.current?.blur();
    }
  }, [focus]);

  return (
    <div style={{
      padding: 16,
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      {/* 内容输入 */}
      <TextArea
        ref={textAreaRef}
        value={content}
        onChange={(content) => handlePostChange({ content })}
        autoSize={{ minRows: 2, maxRows: 8 }}
      />

      {/* 媒体上传（不可见）*/}
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={(e) => handleMediaInput(Array.from(e.target.files || []))}
        ref={imageInputRef}
        style={{ display: 'none' }}
      />
      <input
        type="file"
        multiple
        accept="*"
        onChange={(e) => handleMediaInput(Array.from(e.target.files || []))}
        ref={fileInputRef}
        style={{ display: 'none' }}
      />

      {/* 附件 */}
      {attachments.length > 0 && (
        <Space wrap>
          {attachments.map((attachment, index) => (
            <Image
              key={attachment.id}
              src={attachment.thumbnailUrl}
              width={imageSize}
              height={imageSize}
              fit='cover'
              onClick={() => {
                setAttachmentCurrentIndex(index);
                setAttachmentViewerVisible(true);
              }}
            />
          ))}
        </Space>
      )}


      {/* 控制 */}
      <Grid columns={2}>
        <Grid.Item>
          <Space justify="start" block>
            {/* 图片视频选择 */}
            <Button
              color="primary"
              fill="none"
              onClick={() => imageInputRef.current?.click()}
            >
              <PictureOutline />
            </Button>

            {/* 文件选择 */}
            <Button
              color="primary"
              fill="none"
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadOutline />
            </Button>

            {/* 清空媒体资源 */}
            <Button
              color="primary"
              fill="none"
              onClick={handleCleanAttachment}
              disabled={attachments.length === 0}
            >
              <DeleteOutline />
            </Button>
          </Space>
        </Grid.Item>
        <Grid.Item>
          <Space justify="end" block>

            {/* 发送 */}
            <Button
              color="primary"
              fill="none"
              onClick={handleSubmit}
              disabled={!content.trim()}
            >
              <PlayOutline />
            </Button>
          </Space>
        </Grid.Item>
      </Grid>


      {/* 图片预览 */}
      <AttachmentViewer
        attachments={attachments}
        visible={attachmentViewerVisible}
        currentIndex={attachmentCurrentIndex}
        onClose={() => setAttachmentViewerVisible(false)}
        viewContainer={document.body}
      />
    </div>
  );
}
