/** 单张图片的元数据 */
export interface ImageMeta {
  /** 相对于 public/images/ 的路径 */
  src: string;
  /** 缩略图路径（相对于 public/images/），可能为 null */
  thumb: string | null;
  /** 宽度 px */
  width: number;
  /** 高度 px */
  height: number;
  /** 人类可读的文件大小 */
  size: string;
  /** 文件修改时间 ISO 字符串 */
  mtime: string;
}

/** 带设备类型标记的图片 */
export interface TypedImage extends ImageMeta {
  type: 'PC' | 'Mobile';
}

/** 元数据 JSON 结构 */
export interface ImagesMetadata {
  pc: ImageMeta[];
  mobile: ImageMeta[];
  updatedAt: string;
}

/** 排序方式 */
export type SortMode = 'random' | 'newest' | 'oldest' | 'name-asc' | 'name-desc';
