import { Button } from 'antd-mobile';

export default function Me() {
  return (
    <div style={{ padding: 16 }}>
      <h1>我的页面</h1>
      <p>这是个人中心页面，用于展示个人信息</p>
      <Button block color='primary' style={{ margin: '16px 0' }}>
        个人中心按钮
      </Button>
    </div>
  );
}