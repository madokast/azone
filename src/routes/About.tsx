import { Button } from 'antd-mobile';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div style={{ padding: 16 }}>
      <h1>关于页面</h1>
      <p>这是一个使用 React Router DOM 6+ 的示例页面</p>
      <Button block color='primary' style={{ margin: '16px 0' }}>
        关于按钮
      </Button>
      <Link to='/'>
        <Button block color='default'>
          返回首页
        </Button>
      </Link>
    </div>
  );
}