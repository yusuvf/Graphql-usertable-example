import Sidebar from "./Sidebar";
import Head from "next/head";
import styles from "../styles/Layout.module.scss";

const Layout = ({ children }) => {
  return (
    <>
      <Head>
        <title>90Pixel Assesment</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.container}>
        <Sidebar />
        {children}
      </div>
    </>
  );
};

export default Layout;
