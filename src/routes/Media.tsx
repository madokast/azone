import { Button } from 'antd-mobile';

export default function Media() {
  return (
    <div style={{ padding: 16 }}>
      <h1>媒体页面</h1>
      <p>这是媒体页面，用于展示媒体内容</p>
      <Button block color='primary' style={{ margin: '16px 0' }}>
        媒体按钮
      </Button>
    </div>
  );
}