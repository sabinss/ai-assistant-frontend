import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        {/* Remove all technology disclosure */}
        <meta name="generator" content="" />
        <meta name="framework" content="" />
        <meta name="cms" content="" />
        {/* Custom meta tags without technology disclosure */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="CoWrkr" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
