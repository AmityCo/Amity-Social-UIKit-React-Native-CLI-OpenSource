import { useQuery } from '@tanstack/react-query';
import { ShareableLinkModel } from '../../social/types';
import { Client } from '@amityco/ts-sdk-react-native';

const REFERENCE_KEY: Record<ShareableLinkModel, string> = {
  [ShareableLinkModel.posts]: 'postId',
  [ShareableLinkModel.communities]: 'communityId',
  [ShareableLinkModel.users]: 'userId',
};

export function useShareableLink() {
  const { data: config } = useQuery({
    queryKey: ['social-plus-uikit', 'shareable-link-config'],
    queryFn: () => Client?.getShareableLinkConfiguration(),
    enabled: !!Client,
    staleTime: Infinity,
  });

  const getShareLink = (
    model: ShareableLinkModel,
    referenceId: string
  ): string | null => {
    if (!config?.domain || !config?.patterns?.[model]) return null;
    return (
      config.domain +
      config.patterns[model].replace(`{${REFERENCE_KEY[model]}}`, referenceId)
    );
  };

  return { getShareLink };
}
