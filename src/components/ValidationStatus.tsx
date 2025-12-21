import React from "react";
import styles from "./ValidationStatus.module.css";
import logo from "../assets/validacao.png";

interface ValidationStatusProps {
  status: "idle" | "loading" | "approved" | "rejected";
  userName?: string;
  planName?: string;
  previewUrl?: string | null;
  message?: string;
  similarity?: number;
  model?: string;
  onProceedToTriage?: () => void;
}

const ValidationStatus: React.FC<ValidationStatusProps> = ({
  status,
  userName = "Utilizador",
  planName = "Plano Desconhecido",
  previewUrl = null,
  message = "",
  similarity = 0,
  model = "",
  onProceedToTriage,
}) => {
  const isApproved = status === "approved";
  const isRejected = status === "rejected";
  const isLoading = status === "loading";
  const isIdle = status === "idle";

  return (
    <div className={styles.cardContainer}>
      {/* Illustration Section - Always visible unless specified otherwise, or changed based on state */}
      <div className={styles.illustration}>
        {isLoading ? (
          <div className={styles.loadingSpinner}></div>
        ) : (
          <div className={""}>
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="preview"
                className={styles.previewImage}
              />
            ) : isIdle ? (
              <h3
                style={{
                  color: "white",
                  textWrap: "nowrap",
                  fontWeight: "bold",
                }}
              >
                Por favor, preencha o formulário
              </h3>
            ) : (
              <img src={logo} alt="" />
            )}
          </div>
        )}
      </div>

      {isLoading && (
        <div className={styles.loadingText}>A verificar dados...</div>
      )}

      {(isApproved || isRejected) && (
        <div className={styles.userPill}>
          <div className={styles.avatar}>
            {previewUrl ? (
              <img src={previewUrl} alt={userName} />
            ) : (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  userName
                )}&background=random`}
                alt={userName}
              />
            )}
          </div>

          <div className={styles.info}>
            <div className={styles.name}>
              {isApproved ? userName : `${userName} - Encontrado, porém a imagem não condiz com o utilizador oficial.`}
            </div>
            <div className={styles.sub}>
              {isApproved ? planName : "Inválido"}
            </div>
          </div>

          <div
            className={`${styles.statusIcon} ${
              isApproved ? styles.statusApproved : styles.statusRejected
            }`}
          >
            {isApproved ? (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            )}
          </div>
        </div>
      )}

      {/* Footer Message */}
      {isApproved && (
        <>
          <p className={styles.footerMessage}>
            {message || "Assegurado confirmado como membro da seguradora."}
          </p>
          {similarity > 0 && (
            <div className={styles.scoreContainer}>
              <div className={styles.scoreLabel}>Score de Similitude</div>
              <div className={styles.scoreValue}>{similarity.toFixed(2)}%</div>
              <div className={styles.scoreBar}>
                <div
                  className={styles.scoreFill}
                  style={{ width: `${similarity}%` }}
                ></div>
              </div>
              {model && (
                <div className={styles.modelLabel}>Modelo: {model}</div>
              )}
            </div>
          )}
        </>
      )}
      {(
        <button className={styles.triageButton} onClick={onProceedToTriage}>
          Ir para Triagem
        </button>
      )}
      {isRejected && (
        <p className={`${styles.footerMessage} ${styles.errorMessage}`}>
          Dados não correspondem ou paciente não elegível.
        </p>
      )}
      {isIdle && (
        <p className={styles.footerMessage} style={{ opacity: 0.7 }}>
          Aguardando dados...
        </p>
      )}
    </div>
  );
};

export default ValidationStatus;
