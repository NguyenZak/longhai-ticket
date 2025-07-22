'use client';
import IconLockDots from '@/components/icon/icon-lock-dots';
import IconMail from '@/components/icon/icon-mail';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { login } from '@/lib/api';
import { useAuth, broadcastAuthEvent } from '@/contexts/AuthContext';

const ComponentsAuthLoginForm = () => {
    const router = useRouter();
    const { setUser } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Redirect to dashboard if already authenticated (dựa vào AuthContext)
    // const { isAuthenticated, loading: loadingAuth } = useAuth();
    // useEffect(() => {
    //     if (!loadingAuth && isAuthenticated) {
    //         router.push('/');
    //     }
    // }, [isAuthenticated, loadingAuth, router]);

    // Khi vào trang login, luôn xóa token/user để tránh redirect vòng lặp sau khi logout
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user');
            document.cookie = 'token=; Max-Age=0; path=/;';
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !loading) {
            submitForm(e as any);
        }
    };

    const validateForm = () => {
        if (!formData.email.trim()) {
            setError('Email là bắt buộc');
            return false;
        }
        if (!formData.password.trim()) {
            setError('Mật khẩu là bắt buộc');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email.trim())) {
            setError('Email không hợp lệ');
            return false;
        }
        if (formData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }
        return true;
    };

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            console.log('🔧 Login form: submitting with', { email: formData.email });
            const data = await login(formData.email, formData.password);
            
            console.log('✅ Login API response:', data);
            
            // Update AuthContext
            setUser(data.user);
            console.log('✅ User set in AuthContext:', data.user);
            
            // Broadcast login event
            broadcastAuthEvent('LOGIN', data.user);
            console.log('✅ Login event broadcasted');
            
            console.log('✅ Login successful, redirecting to dashboard...');
            
            // Redirect đến dashboard - sử dụng window.location để đảm bảo hoạt động
            window.location.href = '/';
            
        } catch (err: any) {
            console.error('❌ Login error:', err);
            setError(err.message || 'Không thể kết nối đến server. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-5 dark:text-white" onSubmit={submitForm}>
            {error && (
                <div className="alert alert-danger">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle opacity="0.5" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M12 7V13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        <circle cx="12" cy="16" r="1" fill="currentColor" />
                    </svg>
                    <span>{error}</span>
                </div>
            )}
            
            <div>
                <label htmlFor="email">Email</label>
                <div className="relative text-white-dark">
                    <input 
                        id="email" 
                        name="email"
                        type="email" 
                        placeholder="Nhập email" 
                        className="form-input ps-10 placeholder:text-white-dark" 
                        value={formData.email}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        autoComplete="email"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconMail fill={true} />
                    </span>
                </div>
            </div>
            
            <div>
                <label htmlFor="password">Mật khẩu</label>
                <div className="relative text-white-dark">
                    <input 
                        id="password" 
                        name="password"
                        type={showPassword ? "text" : "password"} 
                        placeholder="Nhập mật khẩu" 
                        className="form-input ps-10 placeholder:text-white-dark" 
                        value={formData.password}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        autoComplete="current-password"
                    />
                    <span className="absolute start-4 top-1/2 -translate-y-1/2">
                        <IconLockDots fill={true} />
                    </span>
                    <button
                        type="button"
                        className="absolute end-4 top-1/2 -translate-y-1/2 text-white-dark hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={loading}
                    >
                        {showPassword ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M12 7V12L15 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="1.5" />
                                <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="1.5" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
            
            <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center">
                    <input type="checkbox" className="form-checkbox bg-white dark:bg-black" />
                    <span className="text-white-dark">Ghi nhớ đăng nhập</span>
                </label>
                <a href="#" className="text-primary hover:underline">Quên mật khẩu?</a>
            </div>
            
            <button 
                type="submit" 
                className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]"
                disabled={loading}
            >
                {loading ? (
                    <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Đang đăng nhập...
                    </div>
                ) : (
                    'Đăng nhập'
                )}
            </button>
        </form>
    );
};

export default ComponentsAuthLoginForm;
