import '@/styles/globals.css';
import Head from 'next/head';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme/theme';
import Layout from './components/Layout';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>GreenSupply Co - Inventory Management</title>
        <meta name="description" content="Multi-warehouse inventory management system for sustainable product distribution" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </ThemeProvider>
    </>
  );
}

