import React, { useState } from "react";
import styles from "./TopAvatar.module.css";
import avatarImg from "../assets/heroImg/home7.avif";

export default function TopAvatar({ name, email }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.topAvatar}>
      <img src={avatarImg} alt="User Avatar" onClick={() => setOpen((v) => !v)} />
      {open && (
        <div className={styles.avatarDropdown}>
          <div className={styles.avatarInfo}>
            <div className={styles.avatarName}>{name}</div>
            <div className={styles.avatarEmail}>{email}</div>
          </div>
          <div className={styles.avatarActions}>
            <a href="/profile" className={styles.avatarLink}><i className="fas fa-user"></i> View Profile</a>
            <a href="/subscriptions" className={styles.avatarLink}><i className="fas fa-credit-card"></i> Subscriptions</a>
            <button className={styles.avatarLink} onClick={() => alert('Settings feature coming soon!')}><i className="fas fa-cog"></i> Settings</button>
            <a href="/" className={styles.avatarLink} style={{ color: '#dc3545' }}><i className="fas fa-sign-out-alt"></i> Logout</a>
          </div>
        </div>
      )}
    </div>
  );
}
