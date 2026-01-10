import { useContext } from "react"; // useContext eklendi
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, AuthContext } from "./context/AuthContext"; // AuthContext eklendi
import Login from "./pages/Login";
import Register from "./pages/Register";

// GÜVENLİK GÖREVLİSİ (ProtectedRoute)
// Eğer kullanıcı giriş yapmamışsa, Dashboard yerine Login'e gönderir.
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-4">Yükleniyor...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Basit bir Dashboard (Şimdilik placeholder)
const Dashboard = () => {
  const { logout, user } = useContext(AuthContext);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-primary mb-4">Hoşgeldin, {user?.username || "Gezgin"}!</h1>
      <p className="text-gray-600 mb-6">Dashboard Yükleniyor...</p>
      <button 
        onClick={logout}
        className="bg-danger text-white px-6 py-2 rounded hover:bg-red-600"
      >
        Çıkış Yap
      </button>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      {/* Tüm uygulamayı AuthProvider ile sarmalıyoruz ki her yerden erişilebilsin */}
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Ana Sayfa (Dashboard) - ARTIK KORUMALI! */}
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Bilinmeyen rotalar için Login'e yönlendir */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;