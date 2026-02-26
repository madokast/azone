import { useRef, useEffect } from 'react';
import { ImageViewer, Button, AutoCenter  } from 'antd-mobile';
import { type Attachment } from '../services/attachments';
import { isImageMimeType, isVideoMimeType } from '../services/attachments';
import { MultiImageViewerRef } from 'antd-mobile';

interface AttachmentViewerProps {
  attachments: Attachment[];
  visible: boolean;
  currentIndex: number;
  onClose?: () => void;
  viewContainer?: HTMLElement;
}

export default function AttachmentViewer({
  attachments,
  visible,
  currentIndex,
  onClose,
  viewContainer,
}: AttachmentViewerProps) {
  if (attachments.length === 0) return null;

  const ref = useRef<MultiImageViewerRef>(null);
  useEffect(() => {
    ref.current?.swipeTo(currentIndex);
  }, [visible, currentIndex]);

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

  const renderFooter = (_ :string, index: number) => {
    const attachment = attachments[index];

    if (isImageMimeType(attachment.mimeType)) return null;

    return (
      <div style={{
        marginBottom: 40
      }}>
      <AutoCenter>
        <Button
          color='primary'
          fill='solid'
          shape='rounded'
          onClick={() => handleDownload(index)}
        >
          Download
        </Button>
      </AutoCenter>
      </div>
    );
  };

  const imageRender = (_: string, info: { index: number, ref: React.RefObject<HTMLDivElement> }) => {
    const attachment = attachments[info.index];

    if (isVideoMimeType(attachment.mimeType)) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%'
        }} ref={info.ref}>
          <video muted width='100%' controls src={attachment.sourceUrl} />
        </div>
      );
    }
    // 图片使用默认渲染
    return undefined;
  };

  return (
    <ImageViewer.Multi
      images={images}
      visible={visible}
      defaultIndex={currentIndex}
      imageRender={imageRender}
      renderFooter={renderFooter}
      onClose={onClose}
      getContainer={viewContainer ?? null}
      ref={ref}
    />
  );
}
