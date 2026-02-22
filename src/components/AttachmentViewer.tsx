import { ImageViewer, Space, Image } from 'antd-mobile';
import { type Attachment } from '../storage/attachments';
import { isImageMimeType, isVideoMimeType } from '../storage/attachments';

interface AttachmentViewerProps {
  attachments: Attachment[];
  visible: boolean;
  currentIndex: number;
  onOpen: (index: number) => void;
  onClose: () => void;
}

export default function AttachmentViewer({ 
  attachments, 
  visible, 
  currentIndex, 
  onOpen, 
  onClose 
}: AttachmentViewerProps) {
  const images = attachments.map(attachment => 
    isImageMimeType(attachment.mimeType) ? attachment.sourceUrl : attachment.thumbnailUrl
  );

  const handleDownload = (index: number) => {
    const attachment = attachments[index];
    const link = document.createElement('a');
    link.href = attachment.sourceUrl;
    link.download = `attachment-${attachment.id}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderFooter = (image: string, index: number) => {
    const attachment = attachments[index];
    const isMedia = isImageMimeType(attachment.mimeType) || isVideoMimeType(attachment.mimeType);
    
    if (!isMedia) return null;

    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        padding: '16px',
        background: 'rgba(0, 0, 0, 0.5)'
      }}>
        <div
          style={{
            padding: '8px 16px',
            background: '#1677ff',
            color: '#fff',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
          onClick={() => handleDownload(index)}
        >
          下载
        </div>
      </div>
    );
  };

  const imageRender = (image: string, info: any) => {
    const attachment = attachments[info.index];
    
    if (isVideoMimeType(attachment.mimeType)) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          width: '100%', 
          height: '100%' 
        }}>
          <video 
            muted 
            width='100%' 
            controls 
            src={attachment.sourceUrl}
            style={{ maxHeight: '80vh' }}
          />
        </div>
      );
    }
    
    return undefined;
  };

  return (
    <>
      <Space wrap>
        {attachments.map((attachment, index) => (
          <Image
            key={attachment.id}
            src={isImageMimeType(attachment.mimeType) || isVideoMimeType(attachment.mimeType) 
              ? attachment.thumbnailUrl 
              : attachment.thumbnailUrl}
            width={100}
            height={100}
            fit='cover'
            onClick={() => onOpen(index)}
            style={{ cursor: 'pointer' }}
          />
        ))}
      </Space>
      
      <ImageViewer.Multi
        images={images}
        visible={visible}
        defaultIndex={currentIndex}
        imageRender={imageRender}
        renderFooter={renderFooter}
        onClose={onClose}
      />
    </>
  );
}
