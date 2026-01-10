import Navbar from "./Navbar";

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen bg-gray-50 pb-20"> {/* pb-20: Navbar altında içerik kalmasın diye boşluk */}
            {children}
            <Navbar />
        </div>
    );
};

export default Layout;