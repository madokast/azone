import Post from './Post';
import { List } from 'antd-mobile';

export default function Home() {
  // 创建包含 5 个元素的数组
  const postIds = Array.from({ length: 5 }, (_, index) => index + 1);
  
  return (
    <List>
      {postIds.map((id) => (
        <List.Item key={id}>
          <Post id={id.toString()} />
        </List.Item>
      ))}
    </List>
  );
}