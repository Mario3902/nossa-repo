import React, { useState } from "react";
import styles from "./Login.module.css";
import shape1 from "../../assets/background.png";
import logoImg from "../../assets/logo_img.png";
import { useNavigate } from "react-router";

const Login = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate()
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/validacao-segurado")
    console.log("Email:", email, "Password:", password);
  };

  return (
    <div className={styles.container}>
      {/* Background with decorative shapes */}
      <div className={styles.background}>
        <img src={shape1} alt="" />
      </div>

      {/* Main content */}
      <div className={styles.content}>
        {/* Logo section */}
        <div className={styles.logoSection}>
          <div className={styles.logoIcon}>
            <img src={logoImg} alt="NOSSA Logo" />
          </div>
          <div className={styles.logoTextContainer}>
            <h1 className={styles.logoText}>NOSSA</h1>
            <p className={styles.logoSubtext}>SEGUROS</p>
          </div>
        </div>

        {/* Login card */}
        <div className={styles.loginCard}>
          <h2 className={styles.loginTitle}>Área de Login</h2>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <input
                type="email"
                placeholder="Digite o seu email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <input
                type="password"
                placeholder="Digite a sua palavra passe..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
                required
              />
            </div>

            {/* <a href="#" className={styles.forgotPassword}>
              Esqueci-me da palavra passe
            </a> */}

            <button type="submit" className={styles.loginButton}>
              Entrar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
