import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Desktop Fixed / Mobile Slide-over */}
            <div
                className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <AdminSidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
                    <span className="font-bold text-lg text-slate-800">Admin Panel</span>
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-md"
                    >
                        <FiMenu className="w-6 h-6" />
                    </button>
                </div>

                {/* Scrollable Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 p-6">
                    <div className="container mx-auto max-w-7xl animate-fade-in">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
