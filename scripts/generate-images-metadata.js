const fs = require('fs');
const path = require('path');
const { imageSize } = require('image-size');
const sharp = require('sharp');

const isImage = (filename) => /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(filename);

async function generateMetadata() {
  const rootDir = path.join(process.cwd(), 'public', 'images');
  const thumbDir = path.join(rootDir, '.thumbnails');
  const pc = [];
  const mobile = [];

  if (!fs.existsSync(rootDir)) {
    console.log('❌ public/images directory not found');
    return;
  }

  if (!fs.existsSync(thumbDir)) {
    fs.mkdirSync(thumbDir, { recursive: true });
  }

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

          // 生成缩略图文件名
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

          const imgData = {
            src: relativePath,
            thumb: hasThumb ? `.thumbnails/${thumbFileName}` : null,
            width: dimensions.width,
            height: dimensions.height,
            size: size
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

  const metadata = { pc, mobile, updatedAt: new Date().toISOString() };
  const outputPath = path.join(process.cwd(), 'src', 'lib', 'images-metadata.json');
  
  fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
  console.log(`✅ Metadata generated: ${pc.length} PC images, ${mobile.length} Mobile images`);
  console.log(`📂 Saved to: ${outputPath}`);
}

generateMetadata();
