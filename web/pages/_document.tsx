import { Html, Head, Main, NextScript } from 'next/document'
import Script from 'next/script'

export default function Document() {
  return (
    <Html>
      <Head>
        <Script type='text/javascript' src="https://cdn.rawgit.com/abdmob/x2js/master/xml2json.js"/>
        <link rel="icon" href="/logo.svg" />
      </Head>
      <body>
        <Main />
        <NextScript />
        <Script src="/api/cloud/doctype.js" strategy="lazyOnload"  />
      </body>
    </Html>
  )
}