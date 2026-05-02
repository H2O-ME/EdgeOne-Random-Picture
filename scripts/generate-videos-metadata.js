const fs = require('fs');
const path = require('path');

const isVideo = (filename) => /\.(mp4|webm|mov|avi|mkv|flv|wmv)$/i.test(filename);

const getFormat = (filename) => {
  const ext = filename.split('.').pop().toLowerCase();
  const formatMap = {
    'mp4': 'MP4',
    'webm': 'WebM',
    'mov': 'MOV',
    'avi': 'AVI',
    'mkv': 'MKV',
    'flv': 'FLV',
    'wmv': 'WMV'
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

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
};

async function renameVideosByTime(dir) {
  const list = fs.readdirSync(dir);
  let renamedCount = 0;

  for (const file of list) {
    if (file === '.thumbnails') continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      renamedCount += await renameVideosByTime(filePath);
    } else if (isVideo(file)) {
      if (isAlreadyNamed(file)) continue;

      const ext = path.extname(file);
      const baseName = path.basename(file, ext);
      const timePrefix = formatTime(stat.mtimeMs);
      const newName = `${timePrefix} ${baseName}${ext}`;

      if (fs.existsSync(path.join(dir, newName))) continue;

      fs.renameSync(filePath, path.join(dir, newName));
      console.log(`  🎬 ${file} → ${newName}`);
      renamedCount++;
    }
  }

  return renamedCount;
}

async function generateMetadata() {
  const rootDir = path.join(process.cwd(), 'public', 'videos');
  const videos = [];
  const classifications = new Set();

  if (!fs.existsSync(rootDir)) {
    console.log('📁 Creating public/videos directory...');
    fs.mkdirSync(rootDir, { recursive: true });
    
    const classificationDir = path.join(rootDir, 'Classification');
    if (!fs.existsSync(classificationDir)) {
      fs.mkdirSync(classificationDir, { recursive: true });
    }
    
    const metadata = {
      videos: [],
      classifications: [],
      updatedAt: new Date().toISOString()
    };
    
    const outputPath = path.join(process.cwd(), 'src', 'lib', 'videos-metadata.json');
    fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
    console.log(`✅ Created empty videos metadata: ${outputPath}`);
    console.log(`📂 Please add your video files to: ${rootDir}`);
    return;
  }

  console.log('🔄 Renaming videos by time...');
  await renameVideosByTime(rootDir);

  const walk = async (currentDir) => {
    const list = fs.readdirSync(currentDir);
    for (const file of list) {
      if (file === '.thumbnails') continue;

      const filePath = path.join(currentDir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await walk(filePath);
      } else if (isVideo(file)) {
        try {
          const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');
          const size = formatFileSize(stat.size);

          const pathParts = relativePath.split('/');
          let classification = null;
          const classificationIndex = pathParts.indexOf('Classification');
          if (classificationIndex !== -1 && classificationIndex < pathParts.length - 1) {
            classification = pathParts[classificationIndex + 1];
            classifications.add(classification);
          }

          const fileTime = extractTimestampFromName(file) || stat.mtimeMs;

          const videoData = {
            src: relativePath,
            size: size,
            format: getFormat(file),
            mtime: fileTime,
            classification: classification
          };

          videos.push(videoData);
        } catch (err) {
          console.warn(`⚠️ 无法读取视频信息: ${filePath}`, err.message);
        }
      }
    }
  };

  console.log('🔍 Scanning videos...');
  await walk(rootDir);

  const metadata = {
    videos,
    classifications: Array.from(classifications).sort(),
    updatedAt: new Date().toISOString()
  };

  const outputPath = path.join(process.cwd(), 'src', 'lib', 'videos-metadata.json');
  fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
  console.log(`✅ Metadata generated: ${videos.length} videos, ${classifications.size} Classifications`);
  console.log(`📂 Saved to: ${outputPath}`);
}

generateMetadata();
