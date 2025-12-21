import React, { useState } from "react";
import SquareImg from "../../assets/component_foto.png";
import styles from "./Validacao.module.css";
import Header from "../../components/Header";
import ValidationStatus from "../../components/ValidationStatus";
import FlagsCounter, { FlagItem } from "../../components/FlagsCounter";

interface ValidacaoProps {
  onProceedToTriage?: (data: {
    userName: string;
    userPhoto: string;
    userCartao: string;
    userBi: string;
  }) => void;
}

const Validacao: React.FC<ValidacaoProps> = ({ onProceedToTriage }) => {
  const [cartao, setCartao] = useState("");
  const [bi, setBi] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    approved: boolean;
    name?: string;
    message?: string;
    similarity?: number;
    model?: string;
    verified?: boolean;
  }>(null);
  const [flagNotification, setFlagNotification] = useState(false);
  const [flags, setFlags] = useState<FlagItem[]>([]); // State local de flags

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    setFile(f ?? null);
    setFileName(f ? f.name : null);
    if (f) {
      const url = URL.createObjectURL(f);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const parseVerificationData = (data: any) => {
    const approved = !!(
      data &&
      (data.verified === true ||
        data.approved === true ||
        data.status === "approved" ||
        data.match === true)
    );

    let similarity = 0;
    if (data && data.message) {
      const scoreMatch = data.message.match(/Similarity Score: ([\d.]+)/);
      if (scoreMatch) {
        similarity = parseFloat(scoreMatch[1]);
      }
    } else if (data && typeof data.distance === "number") {
      similarity = Math.max(0, 1 - data.distance);
    }

    return {
      approved,
      name: "Utilizador Verificado",
      message:
        data?.message ||
        (approved ? "✅ Verificação bem-sucedida!" : "❌ Verificação falhou"),
      similarity: Math.round(similarity * 10000) / 100,
      model: data?.model || "N/A",
      verified: data?.verified || false,
    };
  };

  // Função para adicionar flag localmente
  const addSuspiciousFlag = (cartaoNum: string, biNum: string) => {
    const newFlag: FlagItem = {
      id: `suspicious-${Date.now()}`,
      flag: "Possível uso de dados por terceiros",
      userName: "Acesso Suspeito",
      userCartao: cartaoNum,
    };

    setFlags((prev) => [...prev, newFlag]);
    setFlagNotification(true);

    // Remove notificação após 4 segundos
    setTimeout(() => setFlagNotification(false), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setFlagNotification(false);

    // Mock data for fallback testing
    const mockData = {
      detector_backend: "opencv",
      distance: 0,
      message: "✅ Match Found! Similarity Score: 99.5000",
      model: "ArcFace",
      similarity_metric: "cosine",
      threshold: 0.68,
      user_id: 3,
      verified: true,
    };

    const mockDataFalse = {
      detector_backend: "opencv",
      distance: 0,
      message: "x Match Found! Similarity Score: 12.5%",
      model: "ArcFace",
      similarity_metric: "cosine",
      threshold: 0.68,
      user_id: 3,
      verified: false,
    };

    // If a file was selected, send it to the verification endpoint
    if (file) {
      try {
        const url = "http://10.159.250.247:8000/face-verification/verify/3";
        const form = new FormData();
        form.append("image_file", file);

        const resp = await fetch(url, {
          method: "POST",
          body: form,
        });

        if (!resp.ok) {
          console.error("Upload failed", resp.status, "Using mock data");
          const resultData = parseVerificationData(mockData);
          setResult(resultData);

          if (resultData.approved && cartao && bi) {
            addSuspiciousFlag(cartao, bi);
          }
        } else {
          const data = await resp.json().catch(() => null);
          console.log("API Response:", data);

          const resultData = parseVerificationData(data || mockData);
          setResult(resultData);

          if (resultData.approved && cartao && bi) {
            addSuspiciousFlag(cartao, bi);
          }
        }
      } catch (err) {
        console.error("Error uploading file", err, "Using mock data");
        const resultData = parseVerificationData(mockDataFalse);
        setResult(resultData);

        if (!resultData.approved && cartao && bi) {
          addSuspiciousFlag(cartao, bi);
        }
      } finally {
        setLoading(false);
      }

      return;
    }

    // Fallback: if no file, simulate validation using cartao + bi
    setTimeout(() => {
      const approved = cartao === "123456789" && bi === "123456789";
      setResult(
        approved
          ? { approved: true, name: "Mário Fernandes" }
          : { approved: false }
      );

      if (approved && cartao && bi) {
        addSuspiciousFlag(cartao, bi);
      }

      setLoading(false);
    }, 900);
  };

  React.useEffect(() => {
    // revoke preview URL on unmount or when it changes
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className={styles.page}>
      <Header modulo={"Recepção"} />

      {/* Notificação de Flag */}
      {flagNotification && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            background: "#e74c3c",
            color: "white",
            padding: "16px 24px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "12px",
            fontSize: "14px",
            fontWeight: "bold",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          <span style={{ fontSize: "20px" }}>⚠️</span>
          <div>
            <div>Flag registrada</div>
            <div style={{ fontSize: "12px", opacity: 0.9 }}>
              Possível uso de dados por terceiros
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      <FlagsCounter flags={flags} />

      <main className={styles.main}>
        <section className={styles.formPanel}>
          <h1 className={styles.title}>Validação do Seguro</h1>
          <p className={styles.description}>
            Insira os dados do cartão de seguro e documento de identificação
            para iniciar a verificação de fraude e elegibilidade do paciente.
          </p>

          <div className={styles.card}>
            <h3 className={styles.cardTitle}>PAINEL DA RECEPÇÃO</h3>

            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.row}>
                <div style={{ width: "100%" }}>
                  <label className={styles.label}>Cartão de Seguro</label>
                  <input
                    className={styles.input}
                    placeholder="Digite o seu n.º do cartão de seguro"
                    value={cartao}
                    onChange={(e) => setCartao(e.target.value)}
                  />
                </div>
                <div style={{ width: "100%" }}>
                  <label className={styles.label}>Bilhete de identidade</label>
                  <input
                    className={styles.input}
                    placeholder="Digite o seu n.º do BI"
                    value={bi}
                    onChange={(e) => setBi(e.target.value)}
                  />
                </div>
              </div>

              <div className={styles.row}></div>

              <div className={styles.uploadRow}>
                <div className={styles.uploadBox}>
                  <img
                    src={previewUrl ? previewUrl : SquareImg}
                    alt=""
                    width={"100px"}
                    height={"100px"}
                    style={{ borderRadius: "16px" }}
                  />
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                    }}
                  >
                    <div>
                      <input
                        type="file"
                        id="file"
                        onChange={handleFile}
                        className={styles.fileInput}
                      />
                      <label htmlFor="file" className={styles.fileLabel}>
                        Escolha um ficheiro
                      </label>
                      <span className={styles.fileName}>
                        {fileName ?? "Nenhum ficheiro selecionado"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={styles.actions}>
                  <button
                    type="submit"
                    className={styles.verifyButton}
                    disabled={loading}
                  >
                    {loading ? "A verificar..." : "verificar"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </section>

        <aside className={styles.resultPanel}>
          <ValidationStatus
            status={
              loading
                ? "loading"
                : result
                ? result.approved
                  ? "approved"
                  : "rejected"
                : "idle"
            }
            userName={result && result.name ? result.name : "Erasmo Veloso"}
            planName="Plano de Saúde"
            previewUrl={previewUrl}
            message={result?.message}
            similarity={result?.similarity}
            model={result?.model}
            onProceedToTriage={() => {
              if (onProceedToTriage && previewUrl) {
                onProceedToTriage({
                  userName: result?.name || "Utilizador",
                  userPhoto: previewUrl,
                  userCartao: cartao,
                  userBi: bi,
                });
              }
            }}
          />
        </aside>
      </main>
    </div>
  );
};

export default Validacao;
