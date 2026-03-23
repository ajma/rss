import api from './client';

export interface Article {
  id: string;
  feedId: string;
  feedTitle: string;
  feedFaviconUrl: string | null;
  title: string;
  content?: string;
  snippet: string | null;
  url: string | null;
  author: string | null;
  publishedAt: string | null;
  isRead: boolean;
  isSaved: boolean;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  limit: number;
}

export async function getArticles(params: {
  feedId?: string;
  folderId?: string;
  saved?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ArticleListResponse> {
  const res = await api.get('/api/articles', { params });
  return res.data;
}

export async function getArticle(id: string): Promise<Article> {
  const res = await api.get(`/api/articles/${id}`);
  return res.data.article;
}

export async function markArticleRead(id: string, isRead: boolean = true) {
  const res = await api.patch(`/api/articles/${id}/read`, { isRead });
  return res.data.userArticle;
}

export async function toggleArticleSaved(id: string, isSaved: boolean) {
  const res = await api.patch(`/api/articles/${id}/save`, { isSaved });
  return res.data.userArticle;
}

export async function markAllRead(params: { feedId?: string; folderId?: string }) {
  const res = await api.post('/api/articles/mark-all-read', params);
  return res.data;
}
