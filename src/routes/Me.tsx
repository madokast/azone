import { Divider, Form, Segmented, Tag, Input, Button, Switch } from 'antd-mobile';
import { EncryptConfig, S3Config, type UiTheme } from '../services/settings';
import { useState } from 'react';
import { EyeInvisibleOutline, EyeOutline } from 'antd-mobile-icons'
import { createS3ObjectStorage } from '../services/object-storage/s3.fs';
import { showToast } from '../components/toast';
import { downloadJson } from '../tools/download';
import { readFile, selectFile } from '../tools/upload';


type MeProps = {
  theme: UiTheme;
  onThemeChange: (next: UiTheme) => void;
  s3Config: S3Config;
  onS3ConfigChange: (next: Partial<S3Config>) => void;
  encryptConfig: EncryptConfig;
  onEncryptConfigChange: (next: Partial<EncryptConfig>) => void;
};

interface AllConfig {
  s3Config: S3Config;
  encryptConfig: EncryptConfig;
  theme: UiTheme;
}

export default function Me({ theme, onThemeChange, s3Config, onS3ConfigChange, encryptConfig, onEncryptConfigChange }: MeProps) {

  const [themeState, setThemeState] = useState(theme);
  const [s3ConfigState, setS3ConfigState] = useState(s3Config);
  const [encryptConfigState, setEncryptConfigState] = useState(encryptConfig);

  const [s3AccessKeyIdVisible, setS3AccessKeyIdVisible] = useState(false);
  const [s3SecretVisible, setS3SecretVisible] = useState(false);
  const [s3BucketVisible, setS3BucketVisible] = useState(false);
  const [encryptPasswordVisible, setEncryptPasswordVisible] = useState(false);

  const [s3TestButtonDisabled, setS3TestButtonDisabled] = useState(false);

  const setTheme = (next: any) => { // 这里 any 是适配框架，实际是 string
    setThemeState(next as UiTheme);
    onThemeChange(next as UiTheme);
  }

  const setEncryptConfig = (next: Partial<EncryptConfig>) => {
    setEncryptConfigState((prev) => ({ ...prev, ...next }));
    onEncryptConfigChange(next);
  }

  const setS3Config = (next: Partial<S3Config>) => {
    setS3ConfigState((prev) => ({ ...prev, ...next }));
    onS3ConfigChange(next);
  }

  const downloadAllConfig = () => {
    downloadJson('azone-config.json', { s3Config: s3ConfigState, encryptConfig: encryptConfigState, theme: themeState } as AllConfig);
  }

  const importAllConfig = async () => {
    try {
      const file = await selectFile('application/json');
      const content = await readFile(file);
      const config = JSON.parse(content) as AllConfig;
      setS3Config(config.s3Config);
      setEncryptConfig(config.encryptConfig);
      setTheme(config.theme);
      // showToast('Import Config Success');
      window.location.reload();
    } catch (error) {
      console.error(`Import Config Failed: ${error}`);
      showToast(`Import Config Failed`);
    }
  }

  const testS3Config = async () => {
    setS3TestButtonDisabled(true);
    try {
      if (s3ConfigState.workDir.length === 0) {
        showToast('Please input workDir');
        return;
      }
      const rootDirs = await createS3ObjectStorage(s3ConfigState).list("/");
      console.log(`rootDirs: ${rootDirs}`);
      showToast('S3 Connect Success');
    } catch (error) {
      showToast(`S3 Connect Failed: ${error}`);
    } finally {
      setS3TestButtonDisabled(false);
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <div style={{ textAlign: 'center' }}>
        <Tag color='primary' fill='outline'>Dev</Tag> <span style={{ margin: '0 4px' }}></span>
        <Tag color='primary' fill='outline'>Stat</Tag>
      </div>

      <Divider style={{ borderColor: 'rgba(0, 0, 0, 0)' }}>AWS S3 Configuration</Divider>

      {/* s3 配置 */}
      <>
        <Form layout='vertical'>
          <Form.Item name='AccessKeyId' label='AccessKeyId' initialValue={s3ConfigState.accessKeyId} extra={
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
          <Form.Item name='SecretAccessKey' label='SecretAccessKey' initialValue={s3ConfigState.secretAccessKey} extra={
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
          <Form.Item name='Region' label='Region' initialValue={s3ConfigState.region}>
            <Input onChange={(next) => setS3Config({ region: next })} defaultValue={s3ConfigState.region} placeholder='Please input region' />
          </Form.Item>
          <Form.Item name='Bucket' label='Bucket' initialValue={s3ConfigState.bucket} extra={
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
              defaultValue={s3ConfigState.bucket}
              placeholder='Please input bucket'
              type={s3BucketVisible ? 'text' : 'password'} />
          </Form.Item>
          <Form.Item name='Endpoint' label='Endpoint' initialValue={s3ConfigState.endpoint}>
            <Input onChange={(next) => setS3Config({ endpoint: next })} defaultValue={s3ConfigState.endpoint} placeholder='Please input endpoint: https://' />
          </Form.Item>
        </Form>
        <Form layout='horizontal'>
          <Form.Item name='ForcePathStyle' label='ForcePathStyle' initialValue={s3ConfigState.forcePathStyle ? 'true' : 'false'} childElementPosition='right'>
            <Switch defaultChecked={s3ConfigState.forcePathStyle} onChange={(next) => setS3Config({ forcePathStyle: next })} />
          </Form.Item>
        </Form>
        <Form layout='vertical' footer={
          // 测试连接按钮
          <div style={{ textAlign: 'right' }}>
            <Button color='primary' fill='outline' size='mini' onClick={testS3Config} disabled={s3TestButtonDisabled}>
              Test S3 Connection
            </Button>
          </div>
        }>
          <Form.Item name='WorkDir' label='WorkDir' initialValue={s3ConfigState.workDir}>
            <Input onChange={(next) => setS3Config({ workDir: next })} defaultValue={s3ConfigState.workDir} placeholder='Please input workDir' />
          </Form.Item>
        </Form>
      </>

      <Divider style={{ borderColor: 'rgba(0, 0, 0, 0)' }}>Encrypt Configuration</Divider>
      <>
        <Form layout='vertical'>
          <Form.Item name='Password' label='Password' initialValue={encryptConfig.password} extra={
            // 显示密码可见性切换按钮
            <div style={{ cursor: 'pointer' }}>
              {!encryptPasswordVisible ? (
                <EyeInvisibleOutline onClick={() => setEncryptPasswordVisible(true)} />
              ) : (
                <EyeOutline onClick={() => setEncryptPasswordVisible(false)} />
              )}
            </div>
          }>
            <Input onChange={(next) => setEncryptConfig({ password: next })}
              defaultValue={encryptConfigState.password}
              placeholder='Please input password or leave it empty to disable encrypt'
              type={encryptPasswordVisible ? 'text' : 'password'} />
          </Form.Item>
        </Form>
      </>

      <Divider style={{ borderColor: 'rgba(0, 0, 0, 0)' }}>UI Configuration</Divider>

      <Form layout='horizontal'>
        <Form.Item name='theme' label='Theme' childElementPosition='right' initialValue={themeState}>
          <Segmented
            options={[
              { label: 'System', value: 'system' },
              { label: 'Light', value: 'light' },
              { label: 'Dark', value: 'dark' }
            ]}
            defaultValue={themeState}
            onChange={setTheme}
          />
        </Form.Item>
      </Form>

      <Form layout='vertical' footer={
          // 测试连接按钮
          <div style={{ textAlign: 'right' }}>
            <Button color='primary' fill='outline' size='mini' onClick={importAllConfig} disabled={s3TestButtonDisabled}>
              Import Config
            </Button>
            <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
            <Button color='primary' fill='outline' size='mini' onClick={downloadAllConfig} disabled={s3TestButtonDisabled}>
              Export Config
            </Button>
          </div>
        }>
        </Form>
    </div>
  );
}