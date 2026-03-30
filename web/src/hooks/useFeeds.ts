import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSubscriptions, getFolders, subscribeFeed, unsubscribeFeed, createFolder, deleteFolder, importOpml } from '../api/feeds';

export function useSubscriptions() {
  return useQuery({
    queryKey: ['subscriptions'],
    queryFn: getSubscriptions,
  });
}

export function useFolders() {
  return useQuery({
    queryKey: ['folders'],
    queryFn: getFolders,
  });
}

export function useSubscribeFeed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ url, folderId }: { url: string; folderId?: string }) =>
      subscribeFeed(url, folderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

export function useUnsubscribeFeed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unsubscribeFeed,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
    },
  });
}

export function useDeleteFolder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFolder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
    },
  });
}

export function useImportOpml() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: importOpml,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}
