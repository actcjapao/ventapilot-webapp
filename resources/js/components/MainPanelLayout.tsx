import React, { useState } from "react";
import { Link, usePage } from "@inertiajs/react";

type MainPanelLayoutProps = {
   children: React.ReactNode;
   title?: string;
};

type AuthUser = {
   token: string;
   uuid: string;
   name: string;
   email: string;
};

const MainPanelLayout = ({ children, title }: MainPanelLayoutProps) => {
   const [sidebarOpen, setSidebarOpen] = useState(false);

   // Only props related to auth are typed here; url is excluded
   const { url, props } = usePage<{ auth?: { user?: AuthUser | null } }>(); // for active link detection and page props
   const user = props?.auth?.user ?? null;

   const initials = (() => {
      if (!user?.name) return "JD";
      return user.name
         .split(" ")
         .map((n: string) => n[0])
         .slice(0, 2)
         .join("");
   })();

   const navLinkClass = (path: string) =>
      `flex items-center gap-3 px-4 py-2 rounded-lg transition ${
         url.startsWith(path) ? "bg-base-200 text-primary" : "hover:bg-base-200"
      }`;

   const applyMintlifyTheme = (path: string) => {
      return url.startsWith(path) ? "mintlify" : "";
   };

   return (
      <div className="min-h-screen bg-base-200">
         {/* Overlay */}
         {sidebarOpen && (
            <div
               className="fixed inset-0 z-40 bg-black/40 lg:hidden"
               onClick={() => setSidebarOpen(false)}
            />
         )}

         <div className="flex">
            {/* Sidebar */}
            <aside
               className={`fixed inset-y-0 left-0 z-50 w-64 bg-base-100 shadow-md transform transition-transform duration-300
               ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
               lg:static lg:translate-x-0`}
            >
               <div className="p-4 border-b border-b-gray-200 border-base-300">
                  <h2 className="text-xl font-semibold pb-1">
                     Smart Sari Store
                  </h2>
               </div>

               <nav className="p-4 space-y-2">
                  <Link
                     data-theme={`${applyMintlifyTheme("/dashboard")}`}
                     href="/dashboard"
                     className={navLinkClass("/dashboard")}
                  >
                     <span className="icon-[tabler--layout-dashboard-filled] w-5 h-5 shrink-0"></span>
                     Dashboard
                  </Link>

                  <Link
                     data-theme={`${applyMintlifyTheme("/pos")}`}
                     href="/pos"
                     className={navLinkClass("/pos")}
                  >
                     <span className="icon-[tabler--cash-register] w-5 h-5 shrink-0"></span>
                     POS
                  </Link>

                  <Link
                     data-theme={`${applyMintlifyTheme("/products")}`}
                     href="/products"
                     className={navLinkClass("/products")}
                  >
                     <span className="icon-[tabler--box] w-5 h-5 shrink-0"></span>
                     Products
                  </Link>
                  <Link
                     data-theme={`${applyMintlifyTheme("/reports")}`}
                     href="/reports"
                     className={navLinkClass("/reports")}
                  >
                     <span className="icon-[tabler--chart-infographic] w-5 h-5 shrink-0"></span>
                     <span>Reports</span>
                  </Link>
                  <Link
                     data-theme={`${applyMintlifyTheme("/debts")}`}
                     href="/debts"
                     className={navLinkClass("/debts")}
                  >
                     <span className="icon-[tabler--user-dollar] w-5 h-5 shrink-0"></span>
                     <span>Debts</span>
                  </Link>
               </nav>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen">
               {/* Top Navbar */}
               <header className="bg-base-100 shadow-sm px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <button
                        className="lg:hidden btn btn-ghost btn-sm"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                     >
                        ☰
                     </button>
                     <h1 className="text-lg font-semibold">
                        {title ?? "Dashboard"}
                     </h1>
                  </div>

                  <div className="flex items-center gap-4">
                     <span className="text-sm">{user?.name ?? "--"}</span>
                     <div
                        data-theme="mintlify"
                        className="bg-transparent avatar avatar-placeholder"
                     >
                        <div className="bg-primary/10 text-primary size-8 rounded-full flex items-center justify-center">
                           <span className="text-md uppercase pb-0.5">
                              {initials}
                           </span>
                        </div>
                     </div>
                  </div>
               </header>

               {/* Dynamic Page Content */}
               <main className="flex-1 p-6">{children}</main>
            </div>
         </div>
      </div>
   );
};

export default MainPanelLayout;
