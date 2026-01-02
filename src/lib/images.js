import metadata from './images-metadata.json';

export function getImages() {
  return {
    pc: metadata.pc || [],
    mobile: metadata.mobile || []
  };
}
