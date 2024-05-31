export const USERS_SVC = 'users-svc';
export const LIBRARY_SVC = 'library-svc';
export const COMMUNITY_SVC = 'community-svc';
export const VIDEO_STORE_SVC = 'video-store-svc';
export const HISTORY_SVC = 'history-svc';
export const SEARCH_SVC = 'search-svc';
export const VIDEO_PROCESSOR_SVC = 'video-processor-svc';

export const videoManagerMicroserviceClients = [
  [VIDEO_PROCESSOR_SVC, 'VIDEO_PROCESSOR'],
  [VIDEO_STORE_SVC, 'VIDEO_STORE'],
  [COMMUNITY_SVC, 'COMMUNITY'],
  [LIBRARY_SVC, 'LIBRARY'],
  [HISTORY_SVC, 'HISTORY'],
  [SEARCH_SVC, 'SEARCH'],
];
