# n8n-nodes-ffhub

[English](README.md) | 中文

这是 [FFHub](https://ffhub.io) 的 n8n 社区节点 - 云端 FFmpeg 转码服务。

[FFHub](https://ffhub.io) 让你无需管理服务器即可在云端运行 FFmpeg 命令。只需提交 FFmpeg 命令，即可通过 URL 获取输出文件。

[n8n](https://n8n.io/) 是一个 [fair-code 许可](https://docs.n8n.io/reference/license/) 的工作流自动化平台。

## 安装

参考 n8n 社区节点的 [安装指南](https://docs.n8n.io/integrations/community-nodes/installation/)。

```bash
npm install @ffhub/n8n-nodes-ffhub
```

## 支持的操作

| 操作 | 说明 |
|------|------|
| **Create Task** | 创建新的 FFmpeg 转码任务 |
| **Get Task** | 获取任务状态和结果 |
| **List Tasks** | 列出所有任务，支持筛选 |
| **Wait for Completion** | 轮询等待任务完成或失败 |

## 认证配置

使用此节点需要 FFHub API Key：

1. 在 [ffhub.io](https://ffhub.io) 注册账号
2. 进入 Dashboard → API Keys
3. 创建新的 API Key
4. 在 n8n 凭据中使用此 Key

## 使用示例

### 视频压缩

```
FFmpeg Command:
ffmpeg -i https://example.com/input.mp4 -c:v libx264 -crf 23 output.mp4
```

### 格式转换

```
FFmpeg Command:
ffmpeg -i https://example.com/input.mov -c:v libx264 -c:a aac output.mp4
```

### 提取音频

```
FFmpeg Command:
ffmpeg -i https://example.com/video.mp4 -vn -c:a libmp3lame audio.mp3
```

### 生成缩略图

```
FFmpeg Command:
ffmpeg -i https://example.com/video.mp4 -ss 00:00:05 -vframes 1 thumbnail.jpg
```

### 典型工作流

1. **Create Task** - 提交 FFmpeg 命令
2. **Wait for Completion** - 等待任务完成
3. **使用输出** - 输出中包含处理后文件的 URL

## 兼容性

- n8n 版本: 1.0.0+
- Node.js 版本: 18.0.0+

## 相关资源

- [FFHub 文档](https://docs.ffhub.io)
- [FFHub API 参考](https://api.ffhub.io/swagger)
- [n8n 社区节点](https://docs.n8n.io/integrations/community-nodes/)

## 许可证

[MIT](LICENSE)
