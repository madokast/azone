# azone
图片、文件管理器

# 安装方法

```shell
# 设置 npm 的最小发布年龄为 14 天
npm config set min-release-age 14
# 确认最小发布年龄
npm config get before
# 安装
npm install
npm run test
```

# 发布方式

```shell
# 构建项目
npm run build

# 部署到 Vercel
npm i -g vercel
# 登录 Vercel
vercel login
# 部署到开发环境
vercel
# 发布到生产环境
vercel --prod
```
