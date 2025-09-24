import { useStyles } from '../styles';

type UseProfileProps = {
  // userId?: string;
};

function useProfile({}: UseProfileProps = {}) {
  const { styles, theme } = useStyles();

  return {
    styles,
    theme,
  };
}

export default useProfile;
