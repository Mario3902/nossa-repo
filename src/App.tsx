import React, { useState } from "react";
import Login from "./pages/Login/Login";
import Validacao from "./pages/Validacao-seguros/Validacao";
import Triagem from "./pages/Triagem/Triagem";
import Consulta from "./pages/Consulta/Consulta";
import Consultas from "./pages/Consultas/Consultas";
import Clientes from "./pages/Clientes/Clientes";
import Cliente from "./pages/Cliente/Cliente";
import FlagsCounter from "./components/FlagsCounter";
import { Route, Routes, useNavigate } from "react-router";

interface TriagemData {
  userName: string;
  userPhoto: string;
  userCartao: string;
  userBi: string;
}

interface ConsultaData extends TriagemData {
  vitals?: {
    altura?: string;
    peso?: string;
    batimentos?: string;
    pressao?: string;
  };
}

const App: React.FC = () => {
  const [trigemData, setTrigemData] = useState<TriagemData | null>(null);
  const [consultaData, setConsultaData] = useState<ConsultaData | null>(null);
  const navigate = useNavigate();

  const handleProceedToTriage = (data: TriagemData) => {
    setTrigemData(data);
    navigate("/triagem");
  };

  const handleBackFromTriage = () => {
    setTrigemData(null);
    navigate("/validacao-segurado");
  };

  const handleProceedToConsulta = (data: ConsultaData) => {
    setConsultaData(data);
    navigate("/consulta");
  };

  const handleBackFromConsulta = () => {
    setConsultaData(null);
    navigate("/triagem");
  };

  return (
    <>
      
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/validacao-segurado"
          element={<Validacao onProceedToTriage={handleProceedToTriage} />}
        />
        <Route
          path="/triagem"
          element={
            trigemData ? (
              <Triagem
                userName={trigemData.userName}
                userPhoto={trigemData.userPhoto}
                userCartao={trigemData.userCartao}
                userBi={trigemData.userBi}
                onBack={handleBackFromTriage}
                onProceedToConsulta={(vitals) =>
                  handleProceedToConsulta({ ...trigemData, vitals })
                }
              />
            ) : (
              <div>Loading...</div>
            )
          }
        />
        <Route
          path="/consulta"
          element={
            consultaData ? (
              <Consulta
                userName={consultaData.userName}
                userPhoto={consultaData.userPhoto}
                userCartao={consultaData.userCartao}
                userBi={consultaData.userBi}
                vitals={consultaData.vitals}
                onBack={handleBackFromConsulta}
              />
            ) : (
              <div>Loading...</div>
            )
          }
        />
        <Route path="/consultas" element={<Consultas />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/clientes/:cartao" element={<Cliente />} />
      </Routes>
    </>
  );
};

export default App;
