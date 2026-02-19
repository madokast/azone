import { Divider, Form, List, Segmented, Space, Tag } from 'antd-mobile';
import { type UiTheme } from '../storage/settings';

type MeProps = {
  theme: UiTheme;
  onThemeChange: (next: UiTheme) => void;
};

export default function Me({ theme, onThemeChange }: MeProps) {
  return (
    <div style={{ padding: 16 }}>
      <Space>
        <Tag color='primary' fill='outline'>开发中</Tag>
      </Space>

      <Divider>Settings</Divider>

      <Form layout='horizontal'>
        <Form.Item name='theme' label='Theme' childElementPosition='right'>
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