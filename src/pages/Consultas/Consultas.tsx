import React, { useEffect, useState, useMemo } from "react";
import styles from "./Consultas.module.css";
import Header from "../../components/Header";

type TriagemRecord = any;

const computeFlags = (rec: TriagemRecord) => {
  const flags: string[] = [];
  try {
    const v = rec.vitals || {};
    const bpm = parseInt(v.batimentos || "0", 10);
    if (bpm && bpm > 110) flags.push("taquicardia");

    const press = (v.pressao || "").replace(/\s/g, "");
    const m = press.match(/(\d{2,3})/g);
    if (m && parseInt(m[0], 10) >= 140) flags.push("hipertensao");
  } catch (e) {
    // noop
  }
  return flags;
};

// Fixed mock data: two consultations (one with red flags, one without)
const MOCK_RECORDS: TriagemRecord[] = [
  {
    id: "mock-1",
    userName: "Carlos Sampaio",
    userCartao: "00129384",
    userBi: "12345678901234",
    timestamp: new Date(2025, 11, 15, 10, 30, 0).getTime(),
    sent: false,
    vitals: {
      altura: "180",
      peso: "85",
      batimentos: "128",
      pressao: "155/98",
    },
    flagsStatus: {},
  },
  {
    id: "mock-2",
    userName: "Ana Bela Silva",
    userCartao: "00998877",
    userBi: "98765432109876",
    timestamp: new Date(2025, 11, 12, 14, 15, 0).getTime(),
    sent: false,
    vitals: {
      altura: "165",
      peso: "62",
      batimentos: "75",
      pressao: "118/76",
    },
    flagsStatus: {},
  },
];

const getCommonFlags = (records: TriagemRecord[]) => {
  if (records.length === 0) return [];
  const allFlags = records.map((r) => computeFlags(r));
  const flagCounts: Record<string, number> = {};
  for (const flags of allFlags) {
    for (const f of flags) {
      flagCounts[f] = (flagCounts[f] || 0) + 1;
    }
  }
  return Object.entries(flagCounts)
    .filter(([, count]) => count > 1)
    .map(([flag]) => flag);
};

const Consultas: React.FC = () => {
  const [selectedRecord, setSelectedRecord] = useState<TriagemRecord | null>(
    null
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const openId = params.get("open");
    if (openId) {
      const found = MOCK_RECORDS.find((r) => String(r.id) === String(openId));
      if (found) setTimeout(() => setSelectedRecord(found), 100);
    }
  }, []);

  const toggleFlag = (
    id: string,
    flag: string,
    decision: "accepted" | "rejected"
  ) => {
    // Update the selected record state directly
    if (selectedRecord && selectedRecord.id === id) {
      const updated = {
        ...selectedRecord,
        flagsStatus: {
          ...(selectedRecord.flagsStatus || {}),
          [flag]: decision,
        },
      };
      setSelectedRecord(updated);
    }
  };

  const acceptConsulta = (id: string) => {
    // Update consultation state in memory
    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord({ ...selectedRecord, managerDecision: "accepted" });
    }
  };

  const rejectConsulta = (id: string) => {
    // Update consultation state in memory
    if (selectedRecord && selectedRecord.id === id) {
      setSelectedRecord({ ...selectedRecord, managerDecision: "rejected" });
    }
  };

  return (
    <div className={styles.page}>
      <Header modulo="Painel de Consultas" />
      <div className={styles.content}>
        <div className={styles.list}>
          {MOCK_RECORDS.map((r: any) => {
            const flags = computeFlags(r);
            return (
              <div
                className={styles.card}
                key={r.id}
                onClick={() => setSelectedRecord(r)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.rowTop}>
                  <div>
                    <div className={styles.name}>{r.userName}</div>
                    <div className={styles.meta}>
                      {r.userCartao} · {new Date(r.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className={styles.status}>
                    {" "}
                    {r.sent ? "Enviado" : "Pendente"}{" "}
                  </div>
                </div>

                <div className={styles.vitals}>
                  <div>Altura: {r.vitals?.altura || "-"}</div>
                  <div>Peso: {r.vitals?.peso || "-"}</div>
                  <div>Batimentos: {r.vitals?.batimentos || "-"}</div>
                  <div>Pressão: {r.vitals?.pressao || "-"}</div>
                </div>

                {r.invoice && (
                  <div className={styles.invoiceSection}>
                    <div className={styles.invoiceHeader}>
                      <span>
                        Fatura:{" "}
                        {r.invoice.amount.toLocaleString("pt-AO", {
                          style: "currency",
                          currency: "AOA",
                        })}
                      </span>
                    </div>
                    {r.invoice.flags && r.invoice.flags.length > 0 ? (
                      <div className={styles.invoiceFlags}>
                        {r.invoice.flags.map((flag: string, idx: number) => (
                          <span key={idx} className={styles.invoiceFlag}>
                            ⚠️ {flag}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.invoiceOk}>
                        ✅ Fatura em conformidade
                      </div>
                    )}
                  </div>
                )}

                <div className={styles.flags}>
                  {flags.length === 0 && (
                    <div className={styles.noFlags}>Sem flags</div>
                  )}
                  {flags.map((f: string) => (
                    <div className={styles.flag} key={f}>
                      <div className={styles.flagName}>{f}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {selectedRecord && (
          <div className={styles.modal} onClick={() => setSelectedRecord(null)}>
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className={styles.closeBtn}
                onClick={() => setSelectedRecord(null)}
              >
                ✕
              </button>
              <h3 className={styles.modalTitle}>{selectedRecord.userName}</h3>
              <div className={styles.modalBody}>
                <div className={styles.infoGrid}>
                  <div>
                    <strong>Cartão:</strong> {selectedRecord.userCartao}
                  </div>
                  <div>
                    <strong>BI:</strong> {selectedRecord.userBi}
                  </div>
                  <div>
                    <strong>Data:</strong>{" "}
                    {new Date(selectedRecord.timestamp).toLocaleString()}
                  </div>
                  <div>
                    <strong>Status:</strong>{" "}
                    {selectedRecord.sent ? "Enviado" : "Pendente"}
                  </div>
                </div>
                <div className={styles.vitalsDetail}>
                  <strong>Vitais:</strong>
                  <div>Altura: {selectedRecord.vitals?.altura || "-"}</div>
                  <div>Peso: {selectedRecord.vitals?.peso || "-"}</div>
                  <div>
                    Batimentos: {selectedRecord.vitals?.batimentos || "-"}
                  </div>
                  <div>Pressão: {selectedRecord.vitals?.pressao || "-"}</div>
                </div>

                {selectedRecord.invoice && (
                  <div className={styles.vitalsDetail}>
                    <strong>Detalhes da Fatura:</strong>
                    <div>
                      Valor:{" "}
                      {selectedRecord.invoice.amount.toLocaleString("pt-AO", {
                        style: "currency",
                        currency: "AOA",
                      })}
                    </div>
                    <div>Status: {selectedRecord.invoice.status}</div>

                    {selectedRecord.invoice.flags &&
                      selectedRecord.invoice.flags.length > 0 && (
                        <div style={{ marginTop: 8 }}>
                          <strong>Flags de Faturação:</strong>
                          {selectedRecord.invoice.flags.map(
                            (flag: string, idx: number) => (
                              <div
                                key={idx}
                                className={styles.invoiceFlag}
                                style={{ marginTop: 4 }}
                              >
                                ⚠️ {flag}
                              </div>
                            )
                          )}
                        </div>
                      )}
                  </div>
                )}
                <div className={styles.flagsDetail}>
                  <strong>Flags:</strong>
                  {computeFlags(selectedRecord).length === 0 && (
                    <div>Sem flags</div>
                  )}
                  {computeFlags(selectedRecord).map((f: string) => (
                    <div key={f} className={styles.flagDetail}>
                      <span className={styles.flagLabel}>{f}</span>
                      <button
                        onClick={() => {
                          toggleFlag(selectedRecord.id, f, "accepted");
                          setSelectedRecord({
                            ...selectedRecord,
                            flagsStatus: {
                              ...(selectedRecord.flagsStatus || {}),
                              [f]: "accepted",
                            },
                          });
                        }}
                        className={styles.acceptBtn}
                      >
                        Aceitar
                      </button>
                      <button
                        onClick={() => {
                          toggleFlag(selectedRecord.id, f, "rejected");
                          setSelectedRecord({
                            ...selectedRecord,
                            flagsStatus: {
                              ...(selectedRecord.flagsStatus || {}),
                              [f]: "rejected",
                            },
                          });
                        }}
                        className={styles.rejectBtn}
                      >
                        Rejeitar
                      </button>
                      {selectedRecord.flagsStatus &&
                        selectedRecord.flagsStatus[f] && (
                          <span className={styles.decision}>
                            {selectedRecord.flagsStatus[f]}
                          </span>
                        )}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.modalActions}>
                <button
                  className={styles.acceptBig}
                  onClick={() => {
                    acceptConsulta(selectedRecord.id);
                    setSelectedRecord(null);
                  }}
                >
                  Aceitar Consulta
                </button>
                <button
                  className={styles.rejectBig}
                  onClick={() => {
                    rejectConsulta(selectedRecord.id);
                    setSelectedRecord(null);
                  }}
                >
                  Rejeitar Consulta
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Consultas;
