# Vercel Random Picture - halei0v0's Random Random Picture

一个基于 Vercel Pages 构建的随机图片分发系统。
【另一个THW基于EdgeOne的随机图片分发系统】
THW's Demo：https://picture.tianhw.top/

## 🌟 特性

- **🚀 极速响应**：基于 Vercel 全球边缘节点实现图片分发。   
- **📱 智能分发**：自动识别访问者设备类型（PC/移动端），精准推送适配尺寸的图片。
- **🏷️ 分类路由**：根据图片分类自动生成独立 API 路由，新增分类无需手动配置。
- **🎨 格式筛选**：支持按图片格式（WebP/PNG/JPEG）筛选随机图片。
- **🖼️ 沉浸式图库**：内置瀑布流图库，支持 Lightbox 预览、原图下载及 GSAP 丝滑动画。
- **✨ 动感交互**：集成 GSAP 动画引擎，实现沉浸式首页缩放与页面无缝过渡。
- **🛠️ 架构优化**：采用构建时元数据生成技术，分类路由静态预生成。

## 🛠️ 快速开始

### 1. 准备图片

只需将您的图片素材直接**放入** `public/images` 目录即可：
- **无需重命名**：支持任何文件名。
- **格式无忧**：支持 `.jpg`, `.jpeg`, `.jfif`, `.png`, `.gif`, `.webp`, `.bmp`, `.tiff` 等主流格式。
- **支持子目录**：您可以创建文件夹对图片进行分类管理，系统会自动递归扫描。
- **自动分类**：系统会自动识别图片比例：
  - **横屏图片**（宽 > 高）：自动归类为 PC 端素材。
  - **竖屏图片**（高 >= 宽）：自动归类为 移动端素材。
- **📁 自定义分类**：在 `public/images/Classification/` 目录下创建子文件夹，子文件夹的名称将作为分类名称。例如：
  ```
  public/images/Classification/风景/
  public/images/Classification/动漫/
  public/images/Classification/人物/
  ```
  放入对应分类文件夹中的图片将被自动标记为该分类，系统会在构建时自动生成对应的分类 API 路由。
- **构建优化**：图片元数据在构建时自动生成。

### 2. 安装与开发

```bash
# 安装依赖
pnpm install

# 启动本地开发服务器
pnpm dev
```

### 3. 部署

使用 Vercel Pages 部署项目

点击上方一键按钮即可快速部署，相关配置应该会自动识别，也可以照下方参数填写：
- **框架预设**：选择 `Next.js`
- **构建命令**：`npm run build`
- **输出目录**：`.next`

## 📡 API 接口

### 基础接口

| 接口 | 说明 |
|------|------|
| `GET /api/random` | 随机图片重定向 |
| `GET /gallery` | 图库预览 |

### 查询参数

所有 `/api/random` 路由均支持以下查询参数，可自由组合：

| 参数 | 值 | 说明 |
|------|-----|------|
| `type` | `pc` / `mobile` | 指定横屏/竖屏类型，不传则自动识别设备 |
| `format` | `webp` / `png` / `jpeg` | 指定图片格式筛选 |
| `redirect` | `false` | 返回 JSON 格式而非重定向 |

### 分类路由

系统根据 `public/images/Classification/` 下的文件夹自动生成分类 API：

| 接口 | 说明 |
|------|------|
| `/api/random/动漫` | 随机动漫图片 |
| `/api/random/风景` | 随机风景图片 |
| `/api/random/人文` | 随机人文图片 |
| `/api/random/---` | 随机---图片 |

> 新增分类文件夹后，构建时自动生成对应路由，无需手动配置。

### 使用示例

```bash
# 随机一张图片（重定向）
GET /api/random

# 指定类型
GET /api/random?type=pc
GET /api/random?type=mobile

# 指定格式
GET /api/random?format=webp
GET /api/random?format=png

# 分类路由
GET /api/random/动漫
GET /api/random/风景

# 分类 + 类型 + 格式组合
GET /api/random/动漫?type=pc&format=webp
GET /api/random/风景?type=mobile&format=jpeg

# JSON 格式返回（不重定向）
GET /api/random?redirect=false
GET /api/random/动漫?redirect=false

# JSON 返回示例
{
  "url": "/images/Classification/动漫/xxx.webp",
  "width": 1920,
  "height": 1080,
  "size": "248.87 KB",
  "format": "WebP",
  "classification": "动漫",
  "mtime": 1775427360000
}
```

## 📄 许可证

[MIT License](LICENSE)
