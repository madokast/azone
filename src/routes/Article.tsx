import { useParams } from 'react-router-dom';

export default function Article() {
  const { id } = useParams<{ id: string }>();

  return (
    <div style={{ padding: 16 }}>
      <h1>文章详情</h1>
      <p>文章 ID: {id}</p>
      <p>这是文章详情页面，展示文章的详细内容</p>
    </div>
  );
}