import { useState, useEffect } from 'react';
import Sidebar from '@components/Dashboard/Sidebar';
import useSession from '@context/Auth/useSession';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const DashboardLayout = ({ children, title }) => {
    const { session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);

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

                {/* Toggle tab - pestaña que sobresale del sidebar */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    title={sidebarOpen ? 'Contraer barra lateral (Ctrl+B)' : 'Expandir barra lateral (Ctrl+B)'}
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '100%',
                        transform: 'translateY(-50%)',
                        backgroundColor: '#1f2937',
                        color: 'white',
                        border: 'none',
                        borderRadius: '0 6px 6px 0',
                        padding: '10px 4px',
                        cursor: 'pointer',
                        zIndex: 51,
                        boxShadow: '3px 0 8px rgba(0,0,0,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#374151'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#1f2937'}
                >
                    {sidebarOpen
                        ? <FiChevronLeft size={14} />
                        : <FiChevronRight size={14} />
                    }
                </button>
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
                {/* <header className="bg-white shadow-sm border-b border-gray-200">
                    <div className="px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold text-gray-900">
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
                </header> */}

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
