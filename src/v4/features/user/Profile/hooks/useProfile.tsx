import { useStyles } from '../styles';

function useProfile() {
  const { styles, theme } = useStyles();

  return {
    styles,
    theme,
  };
}

export default useProfile;
