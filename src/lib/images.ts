import metadata from './images-metadata.json';
import type { ImagesMetadata } from '@/types';

const data = metadata as ImagesMetadata;

export function getImages(): { pc: ImagesMetadata['pc']; mobile: ImagesMetadata['mobile'] } {
  return {
    pc: data.pc || [],
    mobile: data.mobile || [],
  };
}
