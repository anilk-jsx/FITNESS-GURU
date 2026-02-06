import React from "react";
import Sidebar from "./Sidebar";
import TopAvatar from "./TopAvatar";
import styles from "./DashboardLayout.module.css";

export default function DashboardLayout({ children, user }) {
  return (
    <div className={styles.layoutBg}>
      <Sidebar onLogout={() => window.location.href = '/'} />
      <div className={styles.mainContent}>
        <TopAvatar name={user.name} email={user.email} />
        <main className={styles.dashboardMain}>{children}</main>
      </div>
    </div>
  );
}
