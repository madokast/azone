import { Divider, Form, Segmented, Space, Tag, Input, Button } from 'antd-mobile';
import { S3Config, type UiTheme } from '../services/settings';
import { useState } from 'react';
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons'
import { s3ConnectTest } from '../services/object-storage/s3.fs';
import { showToast } from '../components/toast';


type MeProps = {
  theme: UiTheme;
  onThemeChange: (next: UiTheme) => void;
  s3Config: S3Config;
  onS3ConfigChange: (next: Partial<S3Config>) => void;
};

export default function Me({ theme, onThemeChange, s3Config, onS3ConfigChange }: MeProps) {

  const [s3ConfigState, setS3ConfigState] = useState(s3Config);

  const [s3AccessKeyIdVisible, setS3AccessKeyIdVisible] = useState(false);
  const [s3SecretVisible, setS3SecretVisible] = useState(false);
  const [s3BucketVisible, setS3BucketVisible] = useState(false);

  const [s3TestButtonDisabled, setS3TestButtonDisabled] = useState(false);

  const setS3Config = (next: Partial<S3Config>) => {
    setS3ConfigState((prev) => ({ ...prev, ...next }));
    onS3ConfigChange(next);
  }

  const testS3Config = async () => {
    // setS3TestButtonDisabled(true);
    await s3ConnectTest(s3ConfigState);
    // try {
    //   await s3ConnectTest(s3ConfigState);
    //   showToast('S3 connect success');
    // } catch (error) {
    //   showToast(`S3 connect failed: ${error}`);
    // } finally {
    //   setS3TestButtonDisabled(false);
    // }
  }

  return (
    <div style={{ padding: 16 }}>
      <Space>
        <Tag color='primary' fill='outline'>开发中</Tag>
      </Space>

      <Divider style={{ borderColor: 'rgba(0, 0, 0, 0)' }}>AWS S3 Configuration</Divider>

      {/* s3 配置 */}
      <Form layout='vertical'>
        <Form.Item name='accessKeyId' label='accessKeyId' initialValue={s3ConfigState.accessKeyId} extra={
          // 显示密码可见性切换按钮
          <div style={{ cursor: 'pointer' }}>
            {!s3AccessKeyIdVisible ? (
              <EyeInvisibleOutline onClick={() => setS3AccessKeyIdVisible(true)} />
            ) : (
              <EyeOutline onClick={() => setS3AccessKeyIdVisible(false)} />
            )}
          </div>
        }>
          <Input onChange={(next) => setS3Config({ accessKeyId: next })} 
          defaultValue={s3ConfigState.accessKeyId} 
          placeholder='Please input accessKeyId' 
          type={s3AccessKeyIdVisible ? 'text' : 'password'} />
        </Form.Item>
        <Form.Item name='secretAccessKey' label='secretAccessKey' initialValue={s3ConfigState.secretAccessKey} extra={
          // 显示密码可见性切换按钮
          <div style={{ cursor: 'pointer' }}>
            {!s3SecretVisible ? (
              <EyeInvisibleOutline onClick={() => setS3SecretVisible(true)} />
            ) : (
              <EyeOutline onClick={() => setS3SecretVisible(false)} />
            )}
          </div>
        }>
          <Input onChange={(next) => setS3Config({ secretAccessKey: next })}
            defaultValue={s3ConfigState.secretAccessKey}
            placeholder='Please input secretAccessKey'
            type={s3SecretVisible ? 'text' : 'password'}
          />
        </Form.Item>
        <Form.Item name='region' label='region' initialValue={s3ConfigState.region}>
          <Input onChange={(next) => setS3Config({ region: next })} defaultValue={s3ConfigState.region} placeholder='Please input region' />
        </Form.Item>
        <Form.Item name='bucket' label='bucket' initialValue={s3ConfigState.bucket} extra={
          // 显示密码可见性切换按钮
          <div style={{ cursor: 'pointer' }}>
            {!s3BucketVisible ? (
              <EyeInvisibleOutline onClick={() => setS3BucketVisible(true)} />
            ) : (
              <EyeOutline onClick={() => setS3BucketVisible(false)} />
            )}
          </div>
        }>
          <Input onChange={(next) => setS3Config({ bucket: next })} 
          defaultValue={s3Config.bucket} 
          placeholder='Please input bucket' 
          type={s3BucketVisible ? 'text' : 'password'} />
        </Form.Item>
        <Form.Item name='endpoint' label='endpoint' initialValue={s3Config.endpoint }>
          <Input onChange={(next) => setS3Config({ endpoint: next })} defaultValue={s3Config.endpoint} placeholder='Please input endpoint: https://' />
        </Form.Item>
        <Form.Item name='forcePathStyle' label='forcePathStyle' initialValue={s3Config.forcePathStyle}>
          <Segmented
            options={[
              { label: 'True', value: 'true' },
              { label: 'False', value: 'false' },
            ]}
            defaultValue={s3Config.forcePathStyle ? 'true' : 'false'}
            onChange={(next) => {
              setS3Config({ forcePathStyle: next === 'true' });
            }}
          />
        </Form.Item>
      </Form>

      <Space wrap>
          <Button color='primary' fill='solid' onClick={testS3Config} disabled={s3TestButtonDisabled}>
            Test S3 Connection
          </Button>
        </Space>

      <Divider style={{ borderColor: 'rgba(0, 0, 0, 0)' }}>UI Configuration</Divider>

      <Form layout='horizontal'>
        <Form.Item name='theme' label='Theme' childElementPosition='right' initialValue={theme}>
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