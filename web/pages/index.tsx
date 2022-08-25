import type { NextPage } from "next";
import Head from "next/head";
import { useState, useEffect } from "react";
import styles from "../styles/Home.module.scss";
import { checkAuth } from "../utils/checkAuth";
import { useRouter } from "next/router";
import { Logo } from "../components/logo";
import { MenuBar } from "../components/MenuBar"
import { ComicCard } from "../components/ComicCard";
import { DefaultComicCard } from "../components/DefaultComicCard";
import Image from "next/image";


const Home: NextPage = () => {
  const { data, loading } = checkAuth();
  const [height, setHeight] = useState(0);
  const [heightContain, setHeightContain] = useState(0);


  useEffect(() => {
    if (window !== undefined) {
      window.addEventListener("resize", () => {
        setHeight(window.innerHeight*1/11.5);
        setHeightContain(window.innerHeight-height);
      });
      setHeight(window.innerHeight*1/11.5);
      setHeightContain(window.innerHeight-height);
    }
  } ,[]);
  return (
    <div className={styles.container}>
      <Head>
        <title>Shartube</title>
        <meta name="description" content="Online sharing platform" />
      </Head>
      {loading || (!loading && data?.Me) ? (
        <div className="w-100 h-[100vh] flex justify-center items-center bg-[#141518]">
          <Logo />
        </div>
      ) : (
        <main className={styles.main}>
          <MenuBar height={height} styles={styles} key='shar-secure'/>
          <div className={styles.mainContainer} style={{
            width: "100%",
            height: `calc(100vh - ${height}px)`,
            maxHeight: `${heightContain}px`,
            overflowY: 'auto',
            padding: '20px'
          }}>
            
            <ComicCard />
            <DefaultComicCard />
            
          </div>
        </main>
      )}
    </div>
  );
};

export default Home;
