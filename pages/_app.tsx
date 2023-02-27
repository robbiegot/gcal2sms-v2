import { Session } from 'next-auth';
import { SessionProvider } from 'next-auth/react';
import { CacheProvider, EmotionCache } from '@emotion/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import type { AppProps } from 'next/app';
import createEmotionCache from '../utility/createEmotionCache';
import theme from '../styles/theme'
import styles from '../styles/styles.module.css'

const clientSideEmotionCache = createEmotionCache();

interface MyAppProps extends AppProps<{ session : Session }> {
  emotionCache?: EmotionCache;
}


const App: React.FunctionComponent<MyAppProps> = (props) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;

  return (
    <ThemeProvider theme={theme}>
      <CacheProvider value={emotionCache}>
        <SessionProvider session={pageProps.session}>
          <CssBaseline />
          <Component {...pageProps} />
        </SessionProvider>
    </CacheProvider>
    </ThemeProvider>
  );
};

export default App;
