import Post from './Post';

export default function Home() {
  return (
    <div style={{ padding: 16 }}>
      <h1>首页</h1>
      <p>React + TypeScript + Vite + Ant Design Mobile</p>
      
      <div style={{ marginTop: 24 }}>
        <Post id="1" articleMode={false} />
      </div>
    </div>
  );
}