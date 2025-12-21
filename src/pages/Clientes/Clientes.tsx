import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Clientes.module.css";
import Header from "../../components/Header";

type ClientItem = {
  id: string;
  userName: string;
  userBi: string;
  userCartao: string;
  userPhoto?: string;
};

// Initial mock clients
const MOCK_CLIENTS: ClientItem[] = [
  {
    id: "cli-1",
    userName: "Carlos Sampaio",
    userBi: "12345678901234",
    userCartao: "00129384",
    userPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos",
  },
  {
    id: "cli-2",
    userName: "Ana Bela Silva",
    userBi: "98765432109876",
    userCartao: "00998877",
    userPhoto: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana",
  },
];

const generateRandomCartao = () => {
  const num = Math.floor(Math.random() * 10000000);
  return String(num).padStart(8, "0");
};

// Mock data for consultations count per client
const getMockConsultationsCount = (cartao: string): number => {
  const counts: Record<string, number> = {
    "00129384": 2,
    "00998877": 1,
  };
  return counts[cartao] || 0;
};

const Clientes: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<ClientItem[]>(MOCK_CLIENTS);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<"name" | "cartao">("name");
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ userName: "", userBi: "" });
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const pageSize = 10;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = clients.filter((c) => {
      if (!q) return true;
      return (
        c.userName.toLowerCase().includes(q) ||
        c.userCartao.toLowerCase().includes(q) ||
        c.userBi.toLowerCase().includes(q)
      );
    });

    if (sortKey === "name")
      list = list.sort((a, b) => a.userName.localeCompare(b.userName));
    if (sortKey === "cartao")
      list = list.sort((a, b) => a.userCartao.localeCompare(b.userCartao));

    return list;
  }, [clients, query, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageData = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => setPhotoPreview(evt.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateClient = () => {
    if (!formData.userName.trim() || !formData.userBi.trim()) {
      alert("Preencha nome e BI");
      return;
    }
    const newClient: ClientItem = {
      id: `cli-${Date.now()}`,
      userName: formData.userName,
      userBi: formData.userBi,
      userCartao: generateRandomCartao(),
      userPhoto:
        photoPreview ||
        `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.userName}`,
    };
    setClients([...clients, newClient]);
    setFormData({ userName: "", userBi: "" });
    setPhotoPreview("");
    setShowCreateModal(false);
  };

  const handleDeleteClient = (id: string) => {
    if (confirm("Tem certeza que quer deletar este cliente?")) {
      setClients(clients.filter((c) => c.id !== id));
    }
  };

  return (
    <div className={styles.page}>
      <Header modulo={"Clientes"} />
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <h2 className={styles.header}>Painel de Clientes</h2>
          <div className={styles.controls}>
            <input
              className={styles.search}
              placeholder="Pesquisar por nome, BI ou cartão"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
            />
            <select
              className={styles.select}
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as any)}
            >
              <option value="name">Nome (A→Z)</option>
              <option value="cartao">Cartão</option>
            </select>
            <button
              className={styles.addBtn}
              onClick={() => setShowCreateModal(true)}
            >
              + Novo
            </button>
          </div>
        </div>

        <div className={styles.dashboard}>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Clientes</div>
            <div className={styles.statValue}>{clients.length}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Ativos</div>
            <div className={styles.statValue}>{filtered.length}</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statLabel}>Registrados</div>
            <div className={styles.statValue}>{clients.length}</div>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Cliente</th>
                <th>BI</th>
                <th>Nº Segurado</th>
                <th>Consultas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {pageData.length === 0 && (
                <tr>
                  <td colSpan={5} className={styles.emptyRow}>
                    Nenhum cliente encontrado
                  </td>
                </tr>
              )}
              {pageData.map((c) => (
                <tr key={c.id} className={styles.row}>
                  <td>
                    <div
                      style={{
                        display: "flex",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <img
                        src={c.userPhoto}
                        alt={c.userName}
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                      <div className={styles.name}>{c.userName}</div>
                    </div>
                  </td>
                  <td className={styles.mono}>{c.userBi}</td>
                  <td className={styles.mono}>{c.userCartao}</td>
                  <td className={styles.center}>
                    <button
                      className={styles.consultasBtn}
                      onClick={() => navigate(`/consultas`)}
                    >
                      {getMockConsultationsCount(c.userCartao)} consulta
                      {getMockConsultationsCount(c.userCartao) !== 1 ? "s" : ""}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className={styles.viewBtn}
                        onClick={() => navigate(`/consultas`)}
                      >
                        Ver
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => handleDeleteClient(c.id)}
                      >
                        Deletar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.pager}>
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Anterior
          </button>
          <span>
            {" "}
            {page} / {totalPages}{" "}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Próximo
          </button>
        </div>
      </div>

      {showCreateModal && (
        <div className={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className={styles.closeBtn}
              onClick={() => setShowCreateModal(false)}
            >
              ✕
            </button>
            <h3 className={styles.modalTitle}>Novo Cliente</h3>
            <div className={styles.formGroup}>
              <label>Nome Completo</label>
              <input
                type="text"
                value={formData.userName}
                onChange={(e) =>
                  setFormData({ ...formData, userName: e.target.value })
                }
                placeholder="Ex: João Silva"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Número BI</label>
              <input
                type="text"
                value={formData.userBi}
                onChange={(e) =>
                  setFormData({ ...formData, userBi: e.target.value })
                }
                placeholder="Ex: 12345678901234"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Foto (opcional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="preview"
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "8px",
                    marginTop: "8px",
                  }}
                />
              )}
            </div>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
              <strong>Nº Segurado:</strong> será gerado automaticamente
            </div>
            <div className={styles.modalActions}>
              <button className={styles.createBtn} onClick={handleCreateClient}>
                Criar Cliente
              </button>
              <button
                className={styles.cancelBtn}
                onClick={() => setShowCreateModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
