import { Link, useLocation } from 'react-router-dom';

const Navbar = () => {
    const location = useLocation();

    // Hangi sayfadaysak o butonu aktif (renkli) göster
    const isActive = (path) => location.pathname === path 
        ? "text-primary border-t-2 border-primary" 
        : "text-gray-400 hover:text-gray-600";

    return (
        <nav className="fixed bottom-0 left-0 w-full bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.05)] z-50">
            <div className="max-w-md mx-auto flex justify-around items-center h-16">
                
                <Link to="/" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/')}`}>
                    <span className="text-2xl">🏠</span>
                    <span className="text-xs font-medium">Ana Sayfa</span>
                </Link>

                <Link to="/profile" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/profile')}`}>
                    <span className="text-2xl">👤</span>
                    <span className="text-xs font-medium">Profil</span>
                </Link>

                {/* İleride Arkadaş sayfası gelince burayı açacağız */}
                {/* <Link to="/friends" className={`flex flex-col items-center justify-center w-full h-full ${isActive('/friends')}`}>
                    <span className="text-2xl">👥</span>
                    <span className="text-xs font-medium">Sosyal</span>
                </Link> 
                */}

            </div>
        </nav>
    );
};

export default Navbar;