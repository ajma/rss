import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getArticles, getArticle, markArticleRead, toggleArticleSaved, markAllRead } from '../api/articles';

export function useArticles(params: {
  feedId?: string;
  folderId?: string;
  saved?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['articles', params],
    queryFn: () => getArticles(params),
    enabled: true,
  });
}

export function useArticle(id: string | null) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: () => getArticle(id!),
    enabled: !!id,
  });
}

export function useMarkArticleRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isRead }: { id: string; isRead: boolean }) =>
      markArticleRead(id, isRead),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

export function useToggleArticleSaved() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isSaved }: { id: string; isSaved: boolean }) =>
      toggleArticleSaved(id, isSaved),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

export function useMarkAllRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}
