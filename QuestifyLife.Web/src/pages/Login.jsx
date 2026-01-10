import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate, Link } from "react-router-dom";

// Basit Göz İkonları (SVG)
const EyeIcon = () => (
  <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // Şifre görünürlüğü state'i
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
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary pr-10"
                                placeholder="********"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-primary transition-colors focus:outline-none"
                            >
                                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </div>
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
