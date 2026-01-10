import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setIsSubmitting(true);

        const result = await login(email, password);
        
        if (result.success) {
            navigate("/");
        } else {
            setError(result.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
                <h2 className="text-3xl font-bold text-center text-primary mb-6">Giriş Yap</h2>
                
                {error && (
                    <div className="bg-red-50 border-l-4 border-danger text-red-700 p-4 mb-4 text-sm" role="alert">
                        <p className="font-bold">Hata:</p>
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input 
                            type="email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
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
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                            placeholder="********"
                            required
                        />
                    </div>
                    
                    <button 
                        type="submit" 
                        disabled={isSubmitting}
                        className={`w-full text-white font-bold py-3 rounded-lg transition duration-300 ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary hover:bg-blue-600'}`}
                    >
                        {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-600">
                    Hesabın yok mu? <Link to="/register" className="text-primary font-bold hover:underline">Kayıt Ol</Link>
                </p>
            </div>
        </div>
    );
}
