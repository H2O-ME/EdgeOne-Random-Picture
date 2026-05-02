import metadata from './videos-metadata.json';

export function getVideos() {
  return {
    videos: metadata.videos || [],
    classifications: metadata.classifications || []
  };
}
