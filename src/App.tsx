import React, { useState } from "react";
import Login from "./pages/Login/Login";
import Validacao from "./pages/Validacao-seguros/Validacao";
import Triagem from "./pages/Triagem/Triagem";
import { Route, Routes, useNavigate } from "react-router";

interface TriagemData {
  userName: string;
  userPhoto: string;
  userCartao: string;
  userBi: string;
}

const App: React.FC = () => {
  const [trigemData, setTrigemData] = useState<TriagemData | null>(null);
  const navigate = useNavigate();

  const handleProceedToTriage = (data: TriagemData) => {
    setTrigemData(data);
    navigate("/triagem");
  };

  const handleBackFromTriage = () => {
    setTrigemData(null);
    navigate("/validacao-segurado");
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
              />
            ) : (
              <div>Loading...</div>
            )
          }
        />
      </Routes>
    </>
  );
};

export default App;
