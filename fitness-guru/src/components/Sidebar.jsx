import React from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/FGlogo.png";
import styles from "./Sidebar.module.css";

const navLinks = [
  { to: "/dashboard", icon: "fa-home", label: "Dashboard" },
  { to: "/subscriptions", icon: "fa-credit-card", label: "Subscriptions" },
  { to: "/profile", icon: "fa-user", label: "Profile & Attendance" },
];

export default function Sidebar({ onLogout }) {
  const location = useLocation();
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoSection}>
        <Link to="/" className={styles.logo}>
          <img src={logo} alt="FitnessGuru Logo" />
          <span>FITNESS GURU</span>
        </Link>
      </div>
      <nav className={styles.navMenu}>
        {navLinks.map((link) => (
          <div className={styles.navItem} key={link.to}>
            <Link
              to={link.to}
              className={
                styles.navLink + (location.pathname === link.to ? " " + styles.active : "")
              }
            >
              <i className={`fas ${link.icon}`}></i>
              {link.label}
            </Link>
          </div>
        ))}
      </nav>
      <div className={styles.logoutSection}>
        <button className={styles.logoutBtn} onClick={onLogout}>
          <i className="fas fa-sign-out-alt"></i>
          Logout
        </button>
      </div>
    </aside>
  );
}
