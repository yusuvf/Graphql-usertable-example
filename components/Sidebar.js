import styled from "styled-components";
import Link from "next/link";
import styles from "../styles/Sidebar.module.scss";

const Sidebar = () => {
  return (
    <div className={styles.SidebarContainer}>
      <nav>
        <ul>
          <li>
            <Link href="/">
              <a>
                <button>Home</button>
              </a>
            </Link>
          </li>
          <li>
            <Link href="/about">
              <a>
                <button>About</button>
              </a>
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
