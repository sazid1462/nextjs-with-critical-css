import 'bootstrap/dist/css/bootstrap.css';
import 'core-js/stable';
import { loadCSS } from 'fg-loadcss';
import App from 'next/app';
import Router from 'next/router';
import NProgress from 'nprogress';
import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'regenerator-runtime/runtime';
import GenericLayout from '../components/layouts/GenericLayout';
import '../styles/scss/nprogress.scss';
import '../styles/scss/styles.scss';

NProgress.configure({trickleSpeed: 400});

Router.events.on('routeChangeStart', url => {
  NProgress.start();
});
Router.events.on('routeChangeError', () => NProgress.done());
Router.events.on('routeChangeComplete', () => {
  NProgress.done();
});

if (!String.prototype.startsWith) {
  Object.defineProperty(String.prototype, 'startsWith', {
    value: function (search, rawPos) {
      const pos = rawPos > 0 ? rawPos | 0 : 0;
      return this.substring(pos, pos + search.length) === search;
    }
  });
}

class MyApp extends App {
  componentDidCatch(error, _errorInfo) {
    super.componentDidCatch(error, _errorInfo);
    console.error(error, _errorInfo);
    toast.error(error.message);
  }
  componentDidMount() {
    const cssFiles = window.__STYLES_TO_LOAD || [];
    const critCssInlined = window.__CRITICAL_CSS_INLINED;
    console.log({cssFiles, critCssInlined});
    if (critCssInlined) {
      cssFiles.forEach(file => {
        console.log("loading defered ", file);
        loadCSS( file )
      });
    }
  }

  render() {
    const {Component, pageProps={}, router} = this.props;
    let Layout = Component.Layout || GenericLayout;

    return (
      <>
        <ToastContainer/>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </>
    );
  }
}

export default MyApp;
