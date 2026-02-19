import Post from './Post';
import { List } from 'antd-mobile';

export default function Home() {
  return (
    <List header='最新动态'>
      <List.Item>
        <Post id="1" articleMode={false} />
      </List.Item>
      <List.Item>
        <Post id="2" articleMode={false} />
      </List.Item>
      <List.Item>
        <Post id="3" articleMode={false} />
      </List.Item>
      <List.Item>
        <Post id="4" articleMode={false} />
      </List.Item>
      <List.Item>
        <Post id="5" articleMode={false} />
      </List.Item>
    </List>
  );
}