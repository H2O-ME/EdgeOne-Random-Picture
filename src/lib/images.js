import fs from 'fs';
import path from 'path';
import { imageSize } from 'image-size';

const isImage = (filename) => /\.(jpg|jpeg|png|gif|webp|bmp|tiff)$/i.test(filename);

export function getImages() {
  const rootDir = path.join(process.cwd(), 'public', 'images');
  const pc = [];
  const mobile = [];

  if (!fs.existsSync(rootDir)) return { pc, mobile };

  const walk = (currentDir) => {
    const list = fs.readdirSync(currentDir);
    list.forEach((file) => {
      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walk(filePath);
      } else if (isImage(file) && file !== 'index.html' && file !== 'notfound.jpg') {
        try {
          const buffer = fs.readFileSync(filePath);
          const dimensions = imageSize(buffer);
          const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
          const size = (stat.size / 1024).toFixed(2) + ' KB';

          const imgData = {
            src: relativePath,
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
          console.warn(`⚠️ 无法读取图片尺寸: ${filePath}`, err.message);
        }
      }
    });
  };

  walk(rootDir);
  return { pc, mobile };
}
