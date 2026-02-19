import { useParams, useNavigate } from 'react-router-dom';

interface PostProps {
  articleMode?: boolean;
  id?: string;
  content?: string;
  createdAt?: string;
}

export default function Post({ 
  articleMode = true, 
  id: propId, 
  content = '这是文章的内容，包含很多文字，在非文章模式下只会展示两行，在文章模式下会全部展示。这是文章的内容，包含很多文字，在非文章模式下只会展示两行，在文章模式下会全部展示。',
  createdAt = new Date().toLocaleString()
}: PostProps) {
  const navigate = useNavigate();
  const { id: routeId } = useParams<{ id: string }>();
  const id = propId || routeId || '示例文章';

  const handleClick = () => {
    if (!articleMode && typeof id === 'string' && id !== '示例文章') {
      navigate(`/home/post/${id}`);
    }
  };

  return (
    <div 
      style={{ 
        padding: articleMode ? 16 : 0,
        cursor: !articleMode && typeof id === 'string' && id !== '示例文章' ? 'pointer' : 'default'
      }}
      onClick={handleClick}
    >
      {!articleMode && (
        <div style={{ marginBottom: 8 }}>
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
      )}
      {articleMode && (
        <>
          <h1 style={{ fontSize: 24, marginBottom: 12 }}>文章详情</h1>
          <p style={{ fontSize: 16, lineHeight: 1.5, marginBottom: 16 }}>
            {content}
          </p>
          <div style={{ fontSize: 14, color: '#6e6e6e' }}>
            创建时间: {createdAt}
          </div>
          {typeof id === 'string' && id !== '示例文章' && (
            <div style={{ fontSize: 14, color: '#6e6e6e', marginTop: 8 }}>
              文章 ID: {id}
            </div>
          )}
        </>
      )}
    </div>
  );
}