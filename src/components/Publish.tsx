import { useRef, useState, useEffect } from 'react';
import { TextArea, Button, Space } from 'antd-mobile';
import { TextAreaRef } from 'antd-mobile/es/components/text-area';

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

  const textAreaRef = useRef<TextAreaRef>(null);
  useEffect(() => {
    if (textAreaRef.current) {
      if (focus) {
        // 添加延迟确保组件完全渲染和可见
        setTimeout(() => {
          textAreaRef.current?.focus();
        }, 100);
      } else {
        textAreaRef.current.blur();
      }
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
        style={{
          marginBottom: 16,
          borderRadius: 4
        }}
      />
      <Space direction="vertical" style={{ width: '100%' }}>
        <Button
          color="primary"
          fill="solid"
          onClick={handleSubmit}
          disabled={!content.trim()}
          style={{
            width: '100%'
          }}
        >
          发送
        </Button>
      </Space>
    </div>
  );
}
