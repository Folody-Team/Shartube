import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { ApolloProvider } from "@apollo/client";
import {client} from "../graphql";
import React from 'react'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <React.StrictMode>
      <ApolloProvider client={client}>
        <Component {...pageProps} />   
      </ApolloProvider>
    </React.StrictMode>
  )
}

export default MyApp
