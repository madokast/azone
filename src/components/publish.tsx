import { useState } from 'react';
import { TextArea, Button, Space } from 'antd-mobile';

interface PublishProps {
  onPublish: (content: string) => void;
}

export default function Publish({ onPublish }: PublishProps) {
  const [content, setContent] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onPublish(content.trim());
      setContent('');
    }
  };

  return (
    <div style={{
      padding: 16,
      background: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    }}>
      <TextArea
        placeholder="输入内容..."
        value={content}
        onChange={setContent}
        rows={4}
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
