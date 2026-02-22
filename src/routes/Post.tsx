interface PostProps {
  id?: string;
  content?: string;
  createdAt?: string;
}

export default function Post({ 
  id: propId, 
  content = '这是文章的内容，包含很多文字，在非文章模式下只会展示两行，在文章模式下会全部展示。这是文章的内容，包含很多文字，在非文章模式下只会展示两行，在文章模式下会全部展示。',
  createdAt = new Date().toLocaleString()
}: PostProps) {
  const id = propId || '示例文章';

  return (
    <div style={{ margin: 0 }}>
      <p 
        style={{ 
          fontSize: 14, 
          lineHeight: 1.4, 
          marginBottom: 8,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}
      >
        {content}
      </p>
      <div style={{ fontSize: 12, color: '#6e6e6e' }}>
        {createdAt}
      </div>
    </div>
  );
}