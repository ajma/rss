import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getArticles, getArticle, markArticleRead, toggleArticleSaved, markAllRead, type ArticleListResponse } from '../api/articles';

/**
 * Optimistically update an article's fields in all cached article lists.
 * Articles stay in the list even if they no longer match the active filter —
 * they'll be removed on the next explicit refresh or filter change.
 */
function optimisticArticleUpdate(
  queryClient: ReturnType<typeof useQueryClient>,
  id: string,
  fields: Partial<{ isRead: boolean; isSaved: boolean }>,
) {
  queryClient.setQueriesData<ArticleListResponse>(
    { queryKey: ['articles'] },
    (old) => {
      if (!old) return old;
      return {
        ...old,
        articles: old.articles.map((a) =>
          a.id === id ? { ...a, ...fields } : a
        ),
      };
    },
  );
}

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
    onMutate: async ({ id, isRead }) => {
      await queryClient.cancelQueries({ queryKey: ['articles'] });
      optimisticArticleUpdate(queryClient, id, { isRead });
    },
    onSettled: () => {
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
    onMutate: async ({ id, isSaved }) => {
      await queryClient.cancelQueries({ queryKey: ['articles'] });
      optimisticArticleUpdate(queryClient, id, { isSaved });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
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
