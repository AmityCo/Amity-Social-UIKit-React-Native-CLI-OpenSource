import { useQuery } from '@tanstack/react-query';
import useAuth from '~/hooks/useAuth';

const fetchSocialSettings = async (
  client: Amity.Client
): Promise<Amity.SocialSettings> => {
  if (!client) {
    throw new Error('Client is not available');
  }

  const settings = await client.getSocialSettings();

  return settings;
};

export const useSocialSettings = () => {
  const { client } = useAuth();

  const {
    data: socialSettings,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['socialSettings'],
    queryFn: () => fetchSocialSettings(client),
    enabled: !!client,
  });

  return {
    socialSettings: socialSettings,
    isLoading,
    error,
    refetch,
  };
};
