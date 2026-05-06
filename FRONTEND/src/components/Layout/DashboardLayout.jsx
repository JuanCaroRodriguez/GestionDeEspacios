import { useState } from 'react';
import Sidebar from '@components/Dashboard/Sidebar';
import useSession from '@context/Auth/useSession';

const DashboardLayout = ({ children, title }) => {
    const { session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            {sidebarOpen && (
                <div className="fixed inset-y-0 left-0 z-50 md:relative md:z-auto">
                    <Sidebar user={session?.user} />
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 md:hidden"
                            >
                                <span className="text-xl">☰</span>
                            </button>
                            <h1 className="ml-4 text-xl font-semibold text-gray-900">
                                ClassMatch Dashboard - {title}
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-semibold">
                                        {session?.user?.nombre?.charAt(0)?.toUpperCase()}
                                    </span>
                                </div>
                                <span className="text-sm text-gray-700">{session?.user?.nombre}</span>
                                <span className="text-xs text-gray-500 capitalize">({session?.user?.tipo})</span>
                            </div>
                            <span className="text-sm text-gray-500">
                                {new Date().toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
