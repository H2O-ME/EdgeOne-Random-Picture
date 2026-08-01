const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const { imageSize } = require('image-size');

const isImage = (filename) => /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(filename);
const SKIP_FILES = new Set(['index.html', 'notfound.jpg']);
const CONCURRENCY = 8;

/**
 * 控制并发数的任务执行器
 */
async function runWithConcurrency(tasks, limit) {
  const results = [];
  const executing = new Set();

  for (const task of tasks) {
    const p = task().then(
      (r) => { executing.delete(p); return r; },
      (e) => { executing.delete(p); return { error: e }; }
    );
    executing.add(p);
    results.push(p);
    if (executing.size >= limit) await Promise.race(executing);
  }

  return Promise.all(results);
}

/**
 * 递归收集所有图片文件路径
 */
async function collectImageFiles(rootDir) {
  const files = [];

  async function walk(dir) {
    const entries = await fsp.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === '.thumbnails') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (isImage(entry.name) && !SKIP_FILES.has(entry.name)) {
        files.push(fullPath);
      }
    }
  }

  await walk(rootDir);
  return files;
}

/**
 * 处理单张图片：读取尺寸 + 增量生成缩略图
 */
async function processImage(filePath, rootDir, thumbDir) {
  const stat = await fsp.stat(filePath);
  const buffer = await fsp.readFile(filePath);
  const dimensions = imageSize(buffer);

  if (!dimensions.width || !dimensions.height) {
    console.warn(`⚠️ 无法读取尺寸: ${filePath}`);
    return null;
  }

  const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const size = (stat.size / 1024).toFixed(2) + ' KB';

  // 缩略图文件名（子目录用 _ 替代 /）
  const thumbFileName = relativePath.replace(/\//g, '_');
  const thumbPath = path.join(thumbDir, thumbFileName);
  let hasThumb = false;

  try {
    // 增量检测：仅当缩略图不存在或源文件更新时才重新生成
    let needGenerate = true;
    try {
      const thumbStat = await fsp.stat(thumbPath);
      if (thumbStat.mtimeMs >= stat.mtimeMs) {
        needGenerate = false;
      }
    } catch {
      // 缩略图不存在，需要生成
    }

    if (needGenerate) {
      const sharp = require('sharp');
      await sharp(filePath)
        .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
        .toFile(thumbPath);
    }
    hasThumb = true;
  } catch (sharpErr) {
    console.warn(`⚠️ 缩略图生成失败: ${relativePath} - ${sharpErr.message}`);
  }

  return {
    src: relativePath,
    thumb: hasThumb ? `.thumbnails/${thumbFileName}` : null,
    width: dimensions.width,
    height: dimensions.height,
    size,
    mtime: stat.mtime.toISOString(),
  };
}

async function generateMetadata() {
  const rootDir = path.join(process.cwd(), 'public', 'images');
  const thumbDir = path.join(rootDir, '.thumbnails');

  if (!fs.existsSync(rootDir)) {
    console.error('❌ public/images directory not found');
    process.exit(1);
  }

  await fsp.mkdir(thumbDir, { recursive: true });

  console.log('🔍 Scanning images...');
  const imageFiles = await collectImageFiles(rootDir);
  console.log(`📷 Found ${imageFiles.length} images, processing with concurrency=${CONCURRENCY}...`);

  const tasks = imageFiles.map(
    (filePath) => () => processImage(filePath, rootDir, thumbDir)
  );

  const results = await runWithConcurrency(tasks, CONCURRENCY);

  const pc = [];
  const mobile = [];
  let errorCount = 0;

  for (const result of results) {
    if (!result || result.error) {
      if (result?.error) {
        console.warn(`⚠️ 处理失败: ${result.error.message}`);
      }
      errorCount++;
      continue;
    }
    if (result.width > result.height) {
      pc.push(result);
    } else {
      mobile.push(result);
    }
  }

  const metadata = { pc, mobile, updatedAt: new Date().toISOString() };
  const outputPath = path.join(process.cwd(), 'src', 'lib', 'images-metadata.json');

  await fsp.writeFile(outputPath, JSON.stringify(metadata, null, 2));
  console.log(`✅ Metadata generated: ${pc.length} PC, ${mobile.length} Mobile${errorCount ? `, ${errorCount} errors` : ''}`);
  console.log(`📂 Saved to: ${outputPath}`);
}

generateMetadata()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Metadata generation failed:', err);
    process.exit(1);
  });
