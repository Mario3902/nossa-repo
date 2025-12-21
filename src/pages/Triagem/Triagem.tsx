import React, { useState } from "react";
import styles from "./Triagem.module.css";
import Header from "../../components/Header";

interface TriagemData {
  altura: string;
  peso: string;
  batimentos: string;
  pressao: string;
}

interface TriagemProps {
  userName?: string;
  userPhoto?: string | null;
  userCartao?: string;
  userBi?: string;
  onBack?: () => void;
  onProceedToConsulta?: (data: {
    altura?: string;
    peso?: string;
    batimentos?: string;
    pressao?: string;
    triagemId?: string;
  }) => void;
}

const Triagem: React.FC<TriagemProps> = ({
  userName = "Utilizador",
  userPhoto,
  userCartao = "xxxxxx",
  userBi = "xxxxxxxxxxxxxxxxxx",
  onBack,
  onProceedToConsulta,
}) => {
  const [vitals, setVitals] = useState<TriagemData>({
    altura: "",
    peso: "",
    batimentos: "",
    pressao: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVitals((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Triagem data:", vitals);
    setSubmitted(true);
    // Save triagem record locally so it can be sent later
    try {
      const id = `${Date.now()}`;
      const record = {
        id,
        timestamp: new Date().toISOString(),
        userName,
        userPhoto,
        userCartao,
        userBi,
        vitals,
        sent: false,
      };

      const key = "triagem_records";
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      arr.push(record);
      localStorage.setItem(key, JSON.stringify(arr));

      if (onProceedToConsulta) {
        onProceedToConsulta({ ...vitals, triagemId: id });
      }
    } catch (err) {
      console.error("Failed saving triagem to localStorage", err);
      if (onProceedToConsulta) {
        onProceedToConsulta(vitals);
      }
    }
  };

  return (
    <div className={styles.page}>
      <Header modulo="Triagem clínicas" />

      <main className={styles.mainContent}>
        {/* Background image section */}
        <div className={styles.backgroundSection}>
          {userPhoto && (
            <img src={userPhoto} alt="background" className={styles.bgImage} />
          )}

          {/* Patient Card */}
          <div className={styles.patientCard}>
            <div className={styles.cardContent}>
              <div className={styles.avatarSection}>
                {userPhoto ? (
                  <img
                    src={userPhoto}
                    alt={userName}
                    className={styles.avatar}
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className={styles.patientInfo}>
                <h3 className={styles.patientName}>{userName}</h3>
                <div className={styles.infoLine}>
                  <span>Número de Seguro:</span>
                  <span className={styles.infoValue}>{userCartao}</span>
                </div>
                <div className={styles.infoLine}>
                  <span>BI:</span>
                  <span className={styles.infoValue}>{userBi}</span>
                </div>
                <div className={styles.statusLine}>
                  <span>Status:</span>
                  <span className={styles.statusBadge}>Aceite</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right side title */}
          <div className={styles.titleSection}>
            <h1 className={styles.pageTitle}>Triagem de sinais vitais</h1>
          </div>
        </div>

        {/* Form Section */}
        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Dados Vitais (entrada)</h2>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.fieldsGrid}>
                <div className={styles.fieldGroup}>
                  <label htmlFor="altura">Altura</label>
                  <input
                    type="text"
                    id="altura"
                    name="altura"
                    placeholder="cm"
                    value={vitals.altura}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="peso">Peso(kg)</label>
                  <input
                    type="text"
                    id="peso"
                    name="peso"
                    placeholder="kg"
                    value={vitals.peso}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="batimentos">Batimentos</label>
                  <input
                    type="text"
                    id="batimentos"
                    name="batimentos"
                    placeholder="bpm"
                    value={vitals.batimentos}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <label htmlFor="pressao">Pressão</label>
                  <input
                    type="text"
                    id="pressao"
                    name="pressao"
                    placeholder="mmHg"
                    value={vitals.pressao}
                    onChange={handleChange}
                    className={styles.input}
                  />
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <button type="submit" className={styles.submitButton}>
                  Confirmar
                </button>
                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className={styles.backButton}
                  >
                    Voltar
                  </button>
                )}
              </div>
            </form>

            {submitted && (
              <div className={styles.successMessage}>
                ✅ Dados de triagem registrados com sucesso!
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Triagem;
