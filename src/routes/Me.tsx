import { Divider, Form, Segmented } from 'antd-mobile';
import { type UiTheme } from '../storage/settings';

type MeProps = {
  theme: UiTheme;
  onThemeChange: (next: UiTheme) => void;
};

export default function Me({ theme, onThemeChange }: MeProps) {
  return (
    <div>
      {/* 统计信息区域 */}
      <div style={{ padding: 16 }}>
        <p>开发中...</p>
      </div>
      
      {/* 分割线 */}
      <Divider />
      
      {/* 设置区域 */}
      <Form layout='horizontal'>
        <Form.Item name='theme' label='主题' childElementPosition='right'>
          <Segmented
            options={[
              { label: 'System', value: 'system' },
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' }
            ]}
            defaultValue={theme}
            onChange={(next) => {
              onThemeChange(next as UiTheme);
            }}
          />
        </Form.Item>
      </Form>
    </div>
  );
}