const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size');
const sharp = require('sharp');

const isImage = (filename) => /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(filename);

const getFormat = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const formatMap = {
    'jpg': 'JPEG',
    'jpeg': 'JPEG',
    'png': 'PNG',
    'gif': 'GIF',
    'webp': 'WebP',
    'bmp': 'BMP',
    'tiff': 'TIFF'
  };
  return formatMap[ext] || ext.toUpperCase();
};

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}-${minutes}`;
};

const TIME_PATTERN = /^\d{4}-\d{2}-\d{2} \d{2}-\d{2}/;
const isAlreadyNamed = (filename) => TIME_PATTERN.test(filename);

const extractTimestampFromName = (filename) => {
  const match = filename.match(/(\d{4})-(\d{2})-(\d{2}) (\d{2})-(\d{2})/);
  if (match) {
    return new Date(match[1], match[2] - 1, match[3], match[4], match[5]).getTime();
  }
  return null;
};

async function renameImagesByTime(dir) {
  const list = fs.readdirSync(dir);
  let renamedCount = 0;

  for (const file of list) {
    if (file === '.thumbnails') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      renamedCount += await renameImagesByTime(filePath);
    } else if (isImage(file)) {
      if (isAlreadyNamed(file)) continue;

      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      const timePrefix = formatTime(stat.mtimeMs);
      const newName = `${timePrefix} ${baseName}${ext}`;

      if (fs.existsSync(path.join(dir, newName))) continue;

      fs.renameSync(filePath, path.join(dir, newName));
      console.log(`  📷 ${file} → ${newName}`);
      renamedCount++;
    }
  }

  return renamedCount;
}

async function generateMetadata() {
  const rootDir = path.join(process.cwd(), 'public', 'images');
  const thumbDir = path.join(rootDir, '.thumbnails');
  const pc = [];
  const mobile = [];
  const classifications = new Set();

  if (!fs.existsSync(rootDir)) {
    console.log('❌ public/images directory not found');
    return;
  }

  if (!fs.existsSync(thumbDir)) {
    fs.mkdirSync(thumbDir, { recursive: true });
  }

  console.log('🔄 Renaming images by time...');
  await renameImagesByTime(rootDir);

  const walk = async (currentDir) => {
    const list = fs.readdirSync(currentDir);
    for (const file of list) {
      if (file === '.thumbnails') continue;

      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await walk(filePath);
      } else if (isImage(file) && file !== 'index.html' && file !== 'notfound.jpg') {
        try {
          const buffer = fs.readFileSync(filePath);
          const dimensions = imageSize(buffer);
          const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
          const size = (stat.size / 1024).toFixed(2) + ' KB';

          const pathParts = relativePath.split('/');
          let classification = null;
          const classificationIndex = pathParts.indexOf('Classification');
          if (classificationIndex !== -1 && classificationIndex < pathParts.length - 1) {
            classification = pathParts[classificationIndex + 1];
            classifications.add(classification);
          }

          const thumbFileName = relativePath.replace(/\//g, '_');
          const thumbPath = path.join(thumbDir, thumbFileName);
          let hasThumb = false;

          try {
            if (!fs.existsSync(thumbPath)) {
              await sharp(filePath)
                .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
                .toFile(thumbPath);
            }
            hasThumb = true;
          } catch (sharpErr) {
            console.warn(`⚠️ 缩略图生成失败: ${filePath}`, sharpErr.message);
          }

          const fileTime = extractTimestampFromName(file) || stat.mtimeMs;

          const imgData = {
            src: relativePath,
            thumb: hasThumb ? `.thumbnails/${thumbFileName}` : null,
            width: dimensions.width,
            height: dimensions.height,
            size: size,
            format: getFormat(file),
            mtime: fileTime,
            classification: classification
          };

          if (dimensions.width > dimensions.height) {
            pc.push(imgData);
          } else {
            mobile.push(imgData);
          }
        } catch (err) {
          console.warn(`⚠️ 无法读取图片尺寸 or 生成缩略图: ${filePath}`, err.message);
        }
      }
    }
  };

  console.log('🔍 Scanning images and generating thumbnails...');
  await walk(rootDir);

  const metadata = {
    pc,
    mobile,
    classifications: Array.from(classifications).sort(),
    updatedAt: new Date().toISOString()
  };
  const outputPath = path.join(process.cwd(), 'src', 'lib', 'images-metadata.json');

  fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
  console.log(`✅ Metadata generated: ${pc.length} PC images, ${mobile.length} Mobile images, ${classifications.size} Classifications`);
  console.log(`📂 Saved to: ${outputPath}`);
}

generateMetadata();
