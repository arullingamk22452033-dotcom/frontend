import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

import {
  FaHome,
  FaIndustry,
  FaUsers,
  FaBoxOpen,
  FaUser,
  FaSignOutAlt,
  FaFileInvoice,
  FaChartBar,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaBell,
  FaUserCircle,
  FaChartLine,
  FaBars,
  FaTimes
} from "react-icons/fa";

function Layout() {
  const role = localStorage.getItem("role") || "admin";
  const userName = localStorage.getItem("name") || "Admin";

  const location = useLocation();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const base = role === "admin" ? "/admin" : "/staff";

  // Screen size check panna indha useEffect help pannum
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setMobileMenu(false);
  }, [location.pathname]);

  const logout = () => {
    localStorage.clear();
    window.location.href = "/auth";
  };

  const navItems = [
    { name: "Dashboard", path: `${base}/dashboard`, icon: <FaHome /> },
    { name: "Production", path: `${base}/production`, icon: <FaIndustry /> },
    { name: "Inventory", path: `${base}/inventory`, icon: <FaBoxOpen /> },
    { name: "Workers", path: `${base}/workers`, icon: <FaUsers /> },
    { name: "Invoices", path: `${base}/invoices`, icon: <FaFileInvoice /> },
    { name: "Profit", path: `${base}/profit`, icon: <FaChartLine /> },
    { name: "Profile", path: `${base}/profile`, icon: <FaUser /> }
  ];

  const adminItems = [
    { name: "Salary", path: "/admin/salary", icon: <FaMoneyBillWave /> },
    { name: "Analytics", path: "/admin/analytics", icon: <FaChartBar /> },
    { name: "Daily Report", path: "/admin/daily-report", icon: <FaCalendarAlt /> }
  ];

  const isActive = (path) => location.pathname === path;

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="min-h-screen bg-[#0b1120] text-white flex relative overflow-hidden">

      {/* BACKGROUND */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-cyan-600/10 blur-[120px]" />
      </div>

      {/* OVERLAY (mobile only) */}
      <AnimatePresence>
        {mobileMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileMenu(false)}
            className="fixed inset-0 bg-black/70 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* SIDEBAR - FIXED LOGIC */}
      <motion.aside
        initial={false}
        animate={{
          // Mobile-la mattum x position maaranum, Desktop-la eppovum 0
          x: isMobile ? (mobileMenu ? 0 : -320) : 0
        }}
        transition={{ duration: 0.3 }}
        className="
          fixed top-0 left-0 z-50
          h-screen w-[280px]
          bg-[#111827]/95 backdrop-blur-2xl
          border-r border-white/10
          md:relative md:translate-x-0
        "
      >
        <div className="h-full flex flex-col">

          {/* LOGO */}
          <div className="px-6 py-5 border-b border-white/10 flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-300">
                MillFlow
              </h1>
              <p className="text-xs text-gray-500 tracking-[0.2em] mt-1">
                MANAGEMENT
              </p>
            </div>

            <button
              className="md:hidden text-xl"
              onClick={() => setMobileMenu(false)}
            >
              <FaTimes />
            </button>
          </div>

          {/* NAV */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-2">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={`flex items-center gap-4 px-4 py-3 rounded-2xl border transition-all
                    ${isActive(item.path)
                      ? "bg-indigo-500/20 border-indigo-500/30"
                      : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                    }
                  `}
                >
                  {item.icon}
                  {item.name}
                </motion.div>
              </Link>
            ))}

            {/* ADMIN */}
            {role === "admin" && (
              <div className="pt-6">
                <p className="text-xs text-gray-500 px-3 mb-3 tracking-[0.2em]">
                  ADMIN
                </p>

                {adminItems.map((item) => (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      className={`flex items-center gap-4 px-4 py-3 rounded-2xl border
                        ${isActive(item.path)
                          ? "bg-emerald-500/20 border-emerald-500/30"
                          : "border-transparent text-gray-400 hover:bg-white/5 hover:text-white"
                        }
                      `}
                    >
                      {item.icon}
                      {item.name}
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* USER */}
          <div className="p-4 border-t border-white/10">
            <div className="flex items-center gap-3 mb-4">
              <FaUserCircle className="text-4xl text-indigo-400" />
              <div>
                <h3 className="font-semibold">{userName}</h3>
                <p className="text-xs text-gray-500 uppercase">{role}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/20"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </motion.aside>

      {/* MAIN */}
      <div className="flex-1 flex flex-col z-10 min-w-0">

        {/* HEADER */}
        <header className="h-16 md:h-20 px-4 flex items-center justify-between bg-[#0b1120]/80 backdrop-blur-xl border-b border-white/5">

          <button
            onClick={() => setMobileMenu(true)}
            className="md:hidden w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center"
          >
            <FaBars />
          </button>

          <p className="hidden sm:block text-gray-300 text-sm">
            {currentDate}
          </p>

          <div className="flex items-center gap-4 ml-auto">
            <FaBell />
            <FaUserCircle className="text-indigo-400 text-2xl" />
          </div>
        </header>

        {/* PAGE */}
        <main className="flex-1 p-4">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default Layout;