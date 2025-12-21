import React, { useEffect, useState } from "react";
import styles from "./FlagsCounter.module.css";
import { useNavigate } from "react-router";

export type FlagItem = {
  id: string;
  flag: string;
  userName: string;
  userCartao: string;
};

interface FlagsCounterProps {
  flags?: FlagItem[]; // Recebe flags via props
  onOpenFlag?: (flagId: string, cartao: string) => void; // Callback ao abrir
}

const FlagsCounter: React.FC<FlagsCounterProps> = ({
  flags = [],
  onOpenFlag,
}) => {
  const [count, setCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<FlagItem[]>([]);
  const navigate = useNavigate();

  // Atualiza quando flags prop muda
  useEffect(() => {
    setItems(flags);
    setCount(flags.length);
  }, [flags]);

  const openConsulta = (flagId: string, cartao: string) => {
    if (onOpenFlag) {
      onOpenFlag(flagId, cartao);
    }
    const url = `/consultas?filter=${encodeURIComponent(
      cartao
    )}&open=${encodeURIComponent(flagId)}`;
    navigate(url);
    setOpen(false);
  };

  return (
    <>
      <div
        className={styles.counter}
        onClick={() => setOpen((s) => !s)}
        title="Ver flags"
      >
        <div className={styles.icon}>⚑</div>
        <div className={styles.badge}>{count}</div>
      </div>

      {open && (
        <div className={styles.modal} onClick={() => setOpen(false)}>
          <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
            <div className={styles.panelHeader}>
              <strong>Flags Pendentes ({count})</strong>
              <button className={styles.close} onClick={() => setOpen(false)}>
                ✕
              </button>
            </div>
            <div className={styles.list}>
              {items.length === 0 && (
                <div className={styles.empty}>Sem flags pendentes ✅</div>
              )}
              {items.map((it: FlagItem) => (
                <div key={it.id} className={styles.item}>
                  <div className={styles.itemText}>
                    <strong>{it.flag}</strong>
                    <br />
                    <span style={{ fontSize: "12px", opacity: 0.7 }}>
                      {it.userName} ({it.userCartao})
                    </span>
                  </div>
                  <div className={styles.itemActions}>
                    <button
                      onClick={() => openConsulta(it.id, it.userCartao)}
                      className={styles.goto}
                    >
                      Abrir
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FlagsCounter;
