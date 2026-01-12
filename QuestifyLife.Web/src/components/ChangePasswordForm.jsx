import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { toast } from 'react-toastify';

// İkonlar
const EyeIcon = () => (
  <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
);
const EyeSlashIcon = () => (
  <svg xmlns="[http://www.w3.org/2000/svg](http://www.w3.org/2000/svg)" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
);

const ChangePasswordForm = () => {
    const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.warning("Yeni şifreler eşleşmiyor!");
            return;
        }
        if (passwords.newPassword.length < 6) {
            toast.warning("Yeni şifre en az 6 karakter olmalı.");
            return;
        }

        setLoading(true);
        try {
            await api.post('/Auth/change-password', {
                oldPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            toast.success("Şifren başarıyla güncellendi! 🔒");
            setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            console.error(error);
            // Backend hata mesajını yakala
            if (error.response?.data?.message) {
                toast.error(error.response.data.message);
            } else if (error.response?.data?.errors) {
                const msgs = Object.values(error.response.data.errors).flat().join(", ");
                toast.error(msgs);
            } else {
                toast.error("Şifre değiştirilemedi. Mevcut şifreni kontrol et.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in-up">
            {/* Mevcut Şifre */}
            <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mevcut Şifre</label>
                <input 
                    type={showCurrent ? "text" : "password"} name="currentPassword" value={passwords.currentPassword} onChange={handleChange} required
                    className="w-full p-3 border rounded-lg bg-gray-50 focus:border-primary focus:outline-none pr-10"
                />
                <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-8 text-gray-400 hover:text-primary">
                    {showCurrent ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
            </div>
            
            {/* Yeni Şifre */}
            <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Yeni Şifre</label>
                <input 
                    type={showNew ? "text" : "password"} name="newPassword" value={passwords.newPassword} onChange={handleChange} required
                    className="w-full p-3 border rounded-lg bg-gray-50 focus:border-primary focus:outline-none pr-10"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-8 text-gray-400 hover:text-primary">
                    {showNew ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
            </div>

            {/* Yeni Şifre Tekrar */}
            <div className="relative">
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Yeni Şifre (Tekrar)</label>
                <input 
                    type={showConfirm ? "text" : "password"} name="confirmPassword" value={passwords.confirmPassword} onChange={handleChange} required
                    className="w-full p-3 border rounded-lg bg-gray-50 focus:border-primary focus:outline-none pr-10"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-8 text-gray-400 hover:text-primary">
                    {showConfirm ? <EyeSlashIcon /> : <EyeIcon />}
                </button>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-dark text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition shadow-lg disabled:opacity-50">
                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
            </button>
        </form>
    );
};

export default ChangePasswordForm;