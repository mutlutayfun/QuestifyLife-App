import { Link, useLocation } from 'react-router-dom';

const NavItem = ({ to, image, label, activeColor, activeBg, glowColor }) => {
    const location = useLocation();
    const isActive = location.pathname === to;
    
    return (
        <Link to={to} className="relative group flex-1 flex flex-col items-center justify-center h-full transition-all duration-500">
             {/* Arka Plan Parlaması (Büyü Efekti) */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 rounded-full blur-xl transition-all duration-500 
                ${isActive ? `${glowColor} opacity-40 scale-125` : 'opacity-0 scale-0 group-hover:opacity-20 group-hover:scale-100 group-hover:bg-gray-300'}`} 
            />
            
            {/* Aktif Buton Arka Planı (Yuvarlak) */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl transition-all duration-300 border-2
                ${isActive ? `${activeBg} border-white/50 shadow-lg scale-100` : 'bg-transparent border-transparent scale-75 group-hover:bg-gray-50'}`} 
            />
            
            {/* İkon (Görsel) ve Metin */}
            <div className={`relative z-10 flex flex-col items-center gap-1 transition-all duration-300 ${isActive ? '-translate-y-1.5' : 'translate-y-0'}`}>
                {/* Görsel İkon */}
                <img 
                    src={image} 
                    alt={label}
                    className={`w-8 h-8 object-contain filter drop-shadow-sm transition-transform duration-300 
                        ${isActive ? 'scale-125 animate-bounce-slight' : 'grayscale-[0.7] group-hover:grayscale-0 group-hover:scale-110'}`}
                />
                
                <span className={`text-[10px] font-black tracking-wide transition-all duration-300 
                    ${isActive ? `opacity-100 ${activeColor} translate-y-0` : 'opacity-0 translate-y-2 text-gray-400'}`}>
                    {label}
                </span>
            </div>

             {/* Aktiflik Noktası (Alt Gösterge) */}
             <div className={`absolute bottom-1 w-1.5 h-1.5 rounded-full transition-all duration-500 
                ${isActive ? `bg-current opacity-100 scale-100 ${activeColor}` : 'opacity-0 scale-0'}`} 
            />
        </Link>
    );
};

const Navbar = () => {
    return (
        <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-2xl border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 pb-safe">
            <div className="max-w-md mx-auto flex justify-around items-center h-[80px] px-2">
                <NavItem 
                    to="/" 
                    image="/Castle.png" 
                    label="KALE" 
                    activeColor="text-blue-600" 
                    activeBg="bg-blue-100"
                    glowColor="bg-blue-500"
                />
                <NavItem 
                    to="/history" 
                    image="/History.png" 
                    label="GEÇMİŞ" 
                    activeColor="text-violet-600" 
                    activeBg="bg-violet-100"
                    glowColor="bg-violet-500"
                />
                <NavItem 
                    to="/friends" 
                    image="/HappyAndEce_BF.png" 
                    label="LONCA" 
                    activeColor="text-green-600" 
                    activeBg="bg-green-100"
                    glowColor="bg-green-500"
                />
                <NavItem 
                    to="/leaderboard" 
                    image="/Arena.png" 
                    label="ARENA" 
                    activeColor="text-orange-600" 
                    activeBg="bg-orange-100"
                    glowColor="bg-orange-500"
                />
                <NavItem 
                    to="/profile" 
                    image="/HappyProfile.png" 
                    label="KAHRAMAN" 
                    activeColor="text-pink-600" 
                    activeBg="bg-pink-100"
                    glowColor="bg-pink-500"
                />
            </div>
        </nav>
    );
};

export default Navbar;