import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { checkAuth } from "../utils/checkAuth";
import { useRouter } from "next/router";
import Image from 'next/image'
import { useEffect, useState } from "react";
import {Logo} from '../components/logo';

const Home: NextPage = () => {
  const router = useRouter();
  const { data, loading } = checkAuth();
  

  

  // useEffect(() => {
  //   console.log(data)
  //   window.addEventListener('DOMContentLoaded', () => {
  //     const token = localStorage.getItem('token');
  //     if (token) {
  //       if (data) {

  //         setAuthData(data.Me.username);
  //       }

  //     } else {
  //       router.push('/register');
  //     }
  //   })

  // }, [router]);

  return (
    <div className={styles.container}>
      <Head>
        <title>SharBlock</title>
        <meta name="description" content="Online sharing platform" />
      </Head>
      {
        loading || (!loading && data?.Me) ? (
        <div className='w-100 h-[100vh] flex justify-center items-center bg-[#141518]'>
            <Logo/>
        </div>
        ) : (<main className={styles.main}>
          <div>
            Hello, <span>{data?.Me.username}</span>
          </div>
        </main>)
      }
      
    </div>
  );
};

export default Home;
