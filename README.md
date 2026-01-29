# n8n-nodes-ffhub

English | [中文](README_CN.md)

This is an n8n community node for [FFHub](https://ffhub.io) - a cloud-based FFmpeg transcoding service.

[FFHub](https://ffhub.io) lets you run FFmpeg commands in the cloud without managing servers. Simply submit your FFmpeg command and get the output files via URL.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

```bash
npm install @ffhub/n8n-nodes-ffhub
```

## Operations

This node supports the following operations:

| Operation | Description |
|-----------|-------------|
| **Create Task** | Submit a new FFmpeg transcoding task |
| **Get Task** | Get status and result of a specific task |
| **List Tasks** | List all your tasks with optional filters |
| **Wait for Completion** | Poll until a task completes or fails |

## Credentials

To use this node, you need an FFHub API key:

1. Sign up at [ffhub.io](https://ffhub.io)
2. Go to Dashboard → API Keys
3. Create a new API key
4. Use this key in your n8n credentials

## Usage Examples

### Basic Video Compression

```
FFmpeg Command:
ffmpeg -i https://example.com/input.mp4 -c:v libx264 -crf 23 output.mp4
```

### Convert to Different Format

```
FFmpeg Command:
ffmpeg -i https://example.com/input.mov -c:v libx264 -c:a aac output.mp4
```

### Extract Audio

```
FFmpeg Command:
ffmpeg -i https://example.com/video.mp4 -vn -c:a libmp3lame audio.mp3
```

### Create Thumbnail

```
FFmpeg Command:
ffmpeg -i https://example.com/video.mp4 -ss 00:00:05 -vframes 1 thumbnail.jpg
```

### Typical Workflow

1. **Create Task** - Submit your FFmpeg command
2. **Wait for Completion** - Wait until the task finishes
3. **Use Output** - The output contains URLs to your processed files

## Compatibility

- n8n version: 1.0.0+
- Node.js version: 18.0.0+

## Resources

- [FFHub Documentation](https://docs.ffhub.io)
- [FFHub API Reference](https://api.ffhub.io/swagger)
- [n8n Community Nodes](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](LICENSE)
