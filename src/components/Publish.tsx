import { useRef, useState, useEffect } from 'react';
import { TextArea, Button, Space } from 'antd-mobile';
import { TextAreaRef } from 'antd-mobile/es/components/text-area';
import { PictureOutline, UploadOutline } from 'antd-mobile-icons';

interface PublishProps {
  onPublish: (content: string) => void;
  focus: boolean;
}

export default function Publish({ onPublish, focus }: PublishProps) {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onPublish(content.trim());
      setContent('');
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
      <TextArea
        ref={textAreaRef}
        value={content}
        onChange={setContent}
        autoSize={{ minRows: 2, maxRows: 8 }}
      />

      {/* 图片媒体 */}
      <Space block>

      </Space>

      {/* 控制 */}
      <Space justify="end" block>
        <Button
          color="primary"
          fill="none"
        >
          <PictureOutline />
        </Button>
        <Button
          color="primary"
          fill="none"
          onClick={handleSubmit}
          disabled={!content.trim()}
        >
          <UploadOutline />
        </Button>
      </Space>
    </div>
  );
}
