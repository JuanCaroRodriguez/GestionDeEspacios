import { useState, useEffect } from 'react';
import Sidebar from '@components/Dashboard/Sidebar';
import useSession from '@context/Auth/useSession';

const DashboardLayout = ({ children, title }) => {
    const { session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Atajo de teclado para toggle sidebar (Ctrl+B o Cmd+B)
    useEffect(() => {
        const handleKeyPress = (event) => {
            // Ctrl+B o Cmd+B
            if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
                event.preventDefault();
                setSidebarOpen(!sidebarOpen);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [sidebarOpen]);

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out transform ${
                sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
            } md:relative md:translate-x-0 md:transition-all md:duration-300 md:ease-in-out ${
                sidebarOpen ? 'md:w-64' : 'md:w-16'
            }`}>
                <Sidebar user={session?.user} collapsed={!sidebarOpen} />
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
                sidebarOpen ? 'md:ml-0' : 'md:ml-0'
            }`}>
                {/* Top Bar */}
                <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="group relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 transition-all duration-200 transform hover:scale-105"
                            >
                                <svg 
                                    className={`w-6 h-6 transition-all duration-300 ${sidebarOpen ? 'rotate-0' : 'rotate-180'}`}
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                                </svg>
                                
                                {/* Tooltip */}
                                <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-gray-900 text-white text-sm rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                                    <div>{sidebarOpen ? 'Contraer barra lateral' : 'Expandir barra lateral'}</div>
                                    <div className="text-xs text-gray-400">Ctrl+B</div>
                                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
                                </div>
                            </button>
                            <h1 className={`ml-4 text-xl font-semibold text-gray-900 transition-all duration-300 ${
                                sidebarOpen ? 'opacity-100' : 'opacity-100'
                            }`}>
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
