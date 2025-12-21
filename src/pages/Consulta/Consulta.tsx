import React, { useEffect, useState } from "react";
import Header from "../../components/Header";
import styles from "./Consulta.module.css";

interface ConsultaProps {
  userName?: string;
  userPhoto?: string | null;
  userCartao?: string;
  userBi?: string;
  vitals?: {
    altura?: string;
    peso?: string;
    batimentos?: string;
    pressao?: string;
  };
  onBack?: () => void;
}

const Consulta: React.FC<ConsultaProps> = ({
  userName = "Utilizador",
  userPhoto,
  userCartao = "xxxxxx",
  userBi = "xxxxxxxxxxxxxxxxxx",
  vitals,
  onBack,
}) => {
  const [files, setFiles] = useState<Array<File | null>>([null, null, null]);
  const [fileNames, setFileNames] = useState<string[]>([
    "Nenhum ficheiro selecionado",
    "Nenhum ficheiro selecionado",
    "Nenhum ficheiro selecionado",
  ]);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [triagemRecord, setTriagemRecord] = useState<any | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const f = e.target.files && e.target.files[0];
    const next = [...files];
    next[index] = f ?? null;
    setFiles(next);

    const names = [...fileNames];
    names[index] = f ? f.name : "Nenhum ficheiro selecionado";
    setFileNames(names);
  };

  useEffect(() => {
    try {
      const key = "triagem_records";
      const raw = localStorage.getItem(key);
      const arr = raw ? JSON.parse(raw) : [];
      let rec = null;
      const triagemId = (vitals as any)?.triagemId;
      if (triagemId) {
        rec = arr.find((r: any) => r.id === triagemId) || null;
      }
      if (!rec && userCartao) {
        for (let i = arr.length - 1; i >= 0; i--) {
          if (arr[i].userCartao === userCartao) {
            rec = arr[i];
            break;
          }
        }
      }
      if (rec) {
        setTriagemRecord(rec);
        setSent(!!rec.sent);
      }
    } catch (err) {
      console.error("Failed reading triagem records", err);
    }
  }, [vitals, userCartao]);

  const sendToApi = async () => {
    if (!triagemRecord) return;
    setSending(true);
    try {
      // Replace with your real endpoint
      const endpoint = "/api/consultas";
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(triagemRecord),
      });

      if (resp.ok) {
        // mark as sent in localStorage
        const key = "triagem_records";
        const raw = localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        const idx = arr.findIndex((r: any) => r.id === triagemRecord.id);
        if (idx >= 0) {
          arr[idx].sent = true;
          localStorage.setItem(key, JSON.stringify(arr));
        }
        setSent(true);
      } else {
        console.error("API responded with", resp.status);
      }
    } catch (err) {
      console.error("Failed to send triagem to API", err);
    } finally {
      setSending(false);
    }
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally send notes, files, and vitals to the backend
    console.log("Consulta submit:", { files, notes, vitals });
    setSubmitted(true);
  };

  const neededDocs = [
    {
      id: 1,
      label: "Por favor, faça o upload do exame",
    },
    {
      id: 2,
      label: "Por favor, faça o upload do prestação médica",
    },
    {
      id: 3,
      label: "Por favor, faça o upload da receita",
    },
  ];

  return (
    <div className={styles.page}>
      <Header modulo="Confirmação Médica" />

      <main className={styles.main}>
        <section className={styles.left}>
          <div className={styles.patientCard}>
            <div className={styles.avatarWrap}>
              {userPhoto ? (
                <img src={userPhoto} alt={userName} className={styles.avatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  {userName.charAt(0)}
                </div>
              )}
            </div>

            <h3 className={styles.name}>{userName}</h3>
            <div className={styles.plan}>PLANO VITAL PREMIUM</div>

            <div className={styles.info}>
              <div className={styles.row}>
                <span>Número de Seguro:</span>
                <strong>{userCartao}</strong>
              </div>
              <div className={styles.row}>
                <span>BI:</span>
                <strong>{userBi}</strong>
              </div>
              <div className={styles.row}>
                <span>Status:</span>
                <strong className={styles.approved}>Aprovado</strong>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
              <button className={styles.updateButton}>🔄 Atualizar</button>
              {onBack && (
                <button className={styles.backBtn} onClick={onBack}>
                  Voltar
                </button>
              )}
            </div>
          </div>
        </section>

        <section className={styles.right}>
          <div className={styles.card}>
            <h2 className={styles.title}>Resultado Obtido</h2>

            <form className={styles.form} onSubmit={handleFinish}>
              {neededDocs.map(({ id, label }) => (
                <label key={id} className={styles.fileRow}>
                  <div className={styles.thumb}>📄</div>
                  <div className={styles.fileControls}>
                    <div className={styles.fileText}>{label}</div>
                    <div className={styles.fileActions}>
                      <input
                        type="file"
                        id={`file-${id}`}
                        onChange={(e) => handleFileChange(i, e)}
                        className={styles.fileInput}
                      />
                      <button
                        type="button"
                        className={styles.chooseBtn}
                        onClick={() =>
                          document.getElementById(`file-${id}`)?.click()
                        }
                      >
                        Escolha um ficheiro
                      </button>
                      <div className={styles.fileName}>{fileNames[id]}</div>
                    </div>
                  </div>
                </label>
              ))}

              <div className={styles.notesGroup}>
                <label className={styles.notesLabel}>
                  Observações do Médico
                </label>
                <textarea
                  className={styles.notes}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Escreva as observações da consulta aqui..."
                />
              </div>

              <div className={styles.actions}>
                <button type="submit" className={styles.verifyBtn}>
                  Salvar
                </button>

                {triagemRecord && !sent && (
                  <button
                    type="button"
                    onClick={sendToApi}
                    className={styles.verifyBtn}
                    style={{ background: sending ? "#c8e59a" : undefined }}
                  >
                    {sending ? "Enviando..." : "Enviar para à Seguradora"}
                  </button>
                )}

                {onBack && (
                  <button
                    type="button"
                    onClick={onBack}
                    className={styles.backBtn}
                  >
                    Voltar
                  </button>
                )}
              </div>

              {submitted && (
                <div className={styles.success}>
                  ✔ Consulta salva localmente.
                </div>
              )}

              {sent && (
                <div className={styles.success}>✔ Consulta enviado à SEGURADO.</div>
              )}
            </form>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Consulta;
