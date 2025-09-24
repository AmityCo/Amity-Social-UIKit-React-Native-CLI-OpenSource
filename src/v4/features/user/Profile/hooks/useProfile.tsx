import { useState, useEffect } from 'react';
import { useStyles } from '../styles';
import useAuth from '~/hooks/useAuth';

function useProfile() {
  const { styles, theme } = useStyles();
  const { client } = useAuth();

  const [socialSettings, setSocialSettings] =
    useState<Amity.SocialSettings>(null);

  useEffect(() => {
    (async () => {
      if (client) {
        const settings = await (client as Amity.Client)?.getSocialSettings();
        setSocialSettings(settings);
      }
    })();
  }, [client]);

  return {
    styles,
    theme,
    socialSettings,
  };
}

export default useProfile;
