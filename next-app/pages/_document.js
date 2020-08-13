import Document, { Head, Html, Main, NextScript } from 'next/document';
import React from 'react';

const getCriticalCSSAsync = async (pathname) => {
  try {
    const critCSSBaseUrl = process.env.CRITICAL_CSS_BASE_URL;
    const res = await fetch(`${critCSSBaseUrl}?pagePath=${pathname}`);

    if (res.status >= 400) {
      throw new Error("Bad response from server");
    }

    const content = await res.text();

    return { key: pathname, content };
  } catch (err) {
    console.error(err);
    return null;
  }
}

class DeferStylesHead extends Head {
  getCssLinks() {
    return this.__getDeferedStyles()
  }

  __getDeferedStyles() {
    const { assetPrefix, files } = this.context._documentProps
    const { _devOnlyInvalidateCacheQueryString } = this.context
    const cssFiles =
      files && files.length ? files.filter((f) => f.endsWith('.css')) : []

    const cssLinkElements = [];
    cssFiles.forEach((file) => {
      cssLinkElements.push(
        <link
          key={`${file}-preload`}
          nonce={this.props.nonce}
          rel="preload"
          href={`${assetPrefix}/_next/${encodeURI(
            file
          )}${_devOnlyInvalidateCacheQueryString}`}
          as="style"
          crossOrigin={
            this.props.crossOrigin || process.env.__NEXT_CROSS_ORIGIN
          }
        />
      )
    })

    const cssHrefs = cssFiles.map(file => `${assetPrefix}/_next/${encodeURI(
      file
    )}${_devOnlyInvalidateCacheQueryString}`);

    cssLinkElements.push(
      <script
        key="__DEFERRED_STYLES"
        dangerouslySetInnerHTML={{
          __html: `
            window.__DEFERRED_STYLES = ${JSON.stringify(cssHrefs)}
          `,
        }}
      />,
    );

    return cssLinkElements.length === 0 ? null : cssLinkElements
  }
}

const getStylesLinkElements = (assetPrefix, cssFiles) => {
  return cssFiles.map(file => (
    <link
      key={file}
      rel="stylesheet"
      href={`${assetPrefix}/_next/${encodeURI(file)}`}
      crossOrigin={
        process.env.__NEXT_CROSS_ORIGIN || ""
      }
    />
  ))
}

export default class InStorageDocument extends Document {
  static async getInitialProps(ctx) {
    let initialProps = await Document.getInitialProps(ctx);
    const critCSS = await getCriticalCSSAsync(ctx.pathname);

    return {
      ...initialProps,
      critCSS
    }
  }

  render() {
    const { assetPrefix, critCSS, files } = this.props;
    const cssFiles =
      files && files.length ? files.filter((f) => f.endsWith('.css')) : []

    return (
      <Html lang="sv">
        <DeferStylesHead>
          <meta charSet="utf-8" />
          <meta name="author" content="Sazedul Islam" />
          <meta
            name="viewport"
            content="height=device-height, width=device-width, initial-scale=1.0,
                     minimum-scale=1.0, maximum-scale=1.0, user-scalable=no,
                     target-densitydpi=device-dpi, shrink-to-fit=no"
          />
          <meta property="og:site_name" content="NextJS with CriticalCSS Generator" />
          <link rel="shortcut icon" type="image/png" href="/favicon.ico" />
          <link rel="preconnect" href={process.env.API_BASE_URL} crossOrigin="" />
          {critCSS &&
            <style
              key={critCSS.file}
              dangerouslySetInnerHTML={{
                __html: critCSS.content
              }}
            />}
          {critCSS &&
            <script
              key="__CRITICAL_CSS_INLINED"
              dangerouslySetInnerHTML={{
                __html: `
              window.__CRITICAL_CSS_INLINED = ${JSON.stringify(true)}
            `,
              }}
            />}
          {!critCSS && getStylesLinkElements(assetPrefix, cssFiles)}
        </DeferStylesHead>
        <body>
          <noscript id="loadcss" />

          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
