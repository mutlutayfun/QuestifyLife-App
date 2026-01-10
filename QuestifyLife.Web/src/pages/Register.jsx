import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Basit Ön Kontrol (Client-Side Validation)
        if (password.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır.");
            return;
        }
        if (username.length < 3) {
            setError("Kullanıcı adı en az 3 karakter olmalıdır.");
            return;
        }

        setIsSubmitting(true);

        const result = await register(username, email, password);
        
        if (result.success) {
            alert("Kayıt başarılı! Şimdi giriş yapabilirsin.");
            navigate("/login");
        } else {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-secondary mb-6">Aramıza Katıl</h2>
                
                {error && (
                    <div className="bg-red-50 border-l-4 border-danger text-red-700 p-4 mb-4 text-sm" role="alert">
                        <p className="font-bold">Bir sorun oluştu:</p>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Kullanıcı Adı</label>
                        <input 
                            type="text" 
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                            placeholder="En az 3 karakter"
                            minLength={3}
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                            placeholder="ornek@mail.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Şifre</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary"
                            placeholder="En az 6 karakter"
                            minLength={6}
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full text-white font-bold py-3 rounded-lg transition duration-300 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-secondary hover:bg-green-600'}`}
                    >
                        {isSubmitting ? 'Kaydediliyor...' : 'Kayıt Ol'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Zaten hesabın var mı? <Link to="/login" className="text-secondary font-bold hover:underline">Giriş Yap</Link>
                </p>
            </div>
        </div>
    );
}
