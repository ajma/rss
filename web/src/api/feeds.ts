import api from './client';

export interface Subscription {
  id: string;
  feedId: string;
  title: string;
  url: string;
  siteUrl: string | null;
  faviconUrl: string | null;
  folderId: string | null;
  folderName: string | null;
  unreadCount: number;
}

export interface Folder {
  id: string;
  name: string;
  order: number;
  feeds: Subscription[];
  unreadCount: number;
}

export async function getSubscriptions(): Promise<Subscription[]> {
  const res = await api.get('/api/feeds');
  return res.data.subscriptions;
}

export async function subscribeFeed(url: string, folderId?: string) {
  const res = await api.post('/api/feeds/subscribe', { url, folderId });
  return res.data.subscription;
}

export async function unsubscribeFeed(subscriptionId: string) {
  await api.delete(`/api/feeds/${subscriptionId}`);
}

export async function updateSubscription(
  subscriptionId: string,
  data: { folderId?: string | null; customTitle?: string }
) {
  const res = await api.patch(`/api/feeds/${subscriptionId}`, data);
  return res.data.subscription;
}

export async function getFolders(): Promise<Folder[]> {
  const res = await api.get('/api/folders');
  return res.data.folders;
}

export async function createFolder(name: string) {
  const res = await api.post('/api/folders', { name });
  return res.data.folder;
}

export async function renameFolder(id: string, name: string) {
  const res = await api.patch(`/api/folders/${id}`, { name });
  return res.data.folder;
}

export async function deleteFolder(id: string) {
  await api.delete(`/api/folders/${id}`);
}

export interface ImportOpmlResult {
  imported: number;
  skipped: number;
  total: number;
  errors?: string[];
}

export async function importOpml(opml: string): Promise<ImportOpmlResult> {
  const res = await api.post('/api/feeds/import-opml', { opml });
  return res.data;
}
