import ComponentsAuthLoginForm from '@/components/auth/components-auth-login-form';

const LoginPage = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="w-full max-w-md space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
                        Đăng nhập vào hệ thống
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                        Quản lý bán vé sự kiện
                    </p>
                </div>
                <div className="mt-8 space-y-6">
                    <ComponentsAuthLoginForm />
                </div>
            </div>
        </div>
    );
};

export default LoginPage; 