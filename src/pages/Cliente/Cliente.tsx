import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styles from "./Cliente.module.css";
import Header from "../../components/Header";

type ConsultationItem = {
  id: string;
  clientCartao: string;
  clientName: string;
  timestamp: number;
  vitals: {
    altura: number;
    peso: number;
    bpm: number;
    pressao: string;
  };
  files: string[];
  flagsStatus: Record<string, boolean>;
};

// Mock consultations for each client
const getMockConsultations = (cartao: string): ConsultationItem[] => {
  const baseDate = Date.now();
  const consultations: Record<string, ConsultationItem[]> = {
    "00129384": [
      {
        id: "cons-carlos-1",
        clientCartao: "00129384",
        clientName: "Carlos Sampaio",
        timestamp: baseDate - 7 * 24 * 60 * 60 * 1000, // 7 dias atrás
        vitals: {
          altura: 180,
          peso: 75,
          bpm: 128,
          pressao: "155/98",
        },
        files: ["exame_sangue_carlos.pdf"],
        flagsStatus: { taquicardia: true, hipertensao: true },
      },
      {
        id: "cons-carlos-2",
        clientCartao: "00129384",
        clientName: "Carlos Sampaio",
        timestamp: baseDate - 1 * 24 * 60 * 60 * 1000, // 1 dia atrás
        vitals: {
          altura: 180,
          peso: 76,
          bpm: 85,
          pressao: "135/85",
        },
        files: ["exame_coração_carlos.pdf"],
        flagsStatus: { taquicardia: false, hipertensao: false },
      },
    ],
    "00998877": [
      {
        id: "cons-ana-1",
        clientCartao: "00998877",
        clientName: "Ana Bela Silva",
        timestamp: baseDate - 3 * 24 * 60 * 60 * 1000, // 3 dias atrás
        vitals: {
          altura: 165,
          peso: 62,
          bpm: 75,
          pressao: "118/76",
        },
        files: ["rotina_ana.pdf"],
        flagsStatus: { taquicardia: false, hipertensao: false },
      },
    ],
  };

  return consultations[cartao] || [];
};

const Cliente: React.FC = () => {
  const { cartao } = useParams<{ cartao: string }>();
  const navigate = useNavigate();
  const [sortKey, setSortKey] = useState<"recent" | "old">("recent");

  const consultations = useMemo(() => {
    const list = getMockConsultations(cartao || "");
    if (sortKey === "recent")
      return list.sort((a, b) => b.timestamp - a.timestamp);
    return list.sort((a, b) => a.timestamp - b.timestamp);
  }, [cartao, sortKey]);

  if (!cartao) {
    return (
      <div className={styles.page}>
        <Header modulo="Cliente" />
        <div className={styles.content}>
          <div className={styles.error}>Cliente inválido</div>
        </div>
      </div>
    );
  }

  const clientName =
    consultations.length > 0
      ? consultations[0].clientName
      : "Cliente desconhecido";

  return (
    <div className={styles.page}>
      <Header modulo="Cliente" />
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <div>
            <h2 className={styles.header}>{clientName}</h2>
            <div className={styles.cartao}>Nº Segurado: {cartao}</div>
          </div>
          <button
            className={styles.backBtn}
            onClick={() => navigate("/clientes")}
          >
            ← Voltar
          </button>
        </div>

        <div className={styles.controls}>
          <div style={{ fontSize: "13px", color: "#666" }}>
            <strong>{consultations.length}</strong> consulta
            {consultations.length !== 1 ? "s" : ""}
          </div>
          <select
            className={styles.select}
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as any)}
          >
            <option value="recent">Mais recentes</option>
            <option value="old">Mais antigas</option>
          </select>
        </div>

        <div className={styles.consultasWrap}>
          {consultations.length === 0 && (
            <div className={styles.emptyState}>
              <div className={styles.emptyTitle}>Nenhuma consulta</div>
              <div className={styles.emptyText}>
                Este cliente não possui consultas registradas.
              </div>
            </div>
          )}

          {consultations.map((cons) => {
            const hasFlags = Object.values(cons.flagsStatus).some((f) => f);
            return (
              <div key={cons.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.dateTime}>
                    {new Date(cons.timestamp).toLocaleDateString("pt-PT")}{" "}
                    às{" "}
                    {new Date(cons.timestamp).toLocaleTimeString("pt-PT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                  {hasFlags && (
                    <div className={styles.flagBadge}>⚠️ Com Flags</div>
                  )}
                </div>

                <div className={styles.vitals}>
                  <div className={styles.vitalItem}>
                    <span className={styles.vitalLabel}>Altura:</span>
                    <span className={styles.vitalValue}>{cons.vitals.altura} cm</span>
                  </div>
                  <div className={styles.vitalItem}>
                    <span className={styles.vitalLabel}>Peso:</span>
                    <span className={styles.vitalValue}>{cons.vitals.peso} kg</span>
                  </div>
                  <div className={styles.vitalItem}>
                    <span className={styles.vitalLabel}>BPM:</span>
                    <span
                      className={`${styles.vitalValue} ${
                        cons.vitals.bpm > 110 ? styles.vitalAlert : ""
                      }`}
                    >
                      {cons.vitals.bpm}
                    </span>
                  </div>
                  <div className={styles.vitalItem}>
                    <span className={styles.vitalLabel}>Pressão:</span>
                    <span
                      className={`${styles.vitalValue} ${
                        parseInt(cons.vitals.pressao.split("/")[0]) >= 140
                          ? styles.vitalAlert
                          : ""
                      }`}
                    >
                      {cons.vitals.pressao}
                    </span>
                  </div>
                </div>

                {cons.flagsStatus.taquicardia && (
                  <div className={styles.flagItem}>
                    🚨 Taquicardia detectada
                  </div>
                )}
                {cons.flagsStatus.hipertensao && (
                  <div className={styles.flagItem}>
                    🚨 Hipertensão detectada
                  </div>
                )}

                {cons.files.length > 0 && (
                  <div className={styles.files}>
                    <strong>Arquivos:</strong>
                    {cons.files.map((file, idx) => (
                      <div key={idx} className={styles.fileItem}>
                        📄 {file}
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.cardActions}>
                  <button className={styles.detailBtn}>Ver Detalhes</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Cliente;
