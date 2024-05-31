import React, {useState} from "react";
import VendorTable from "@/components/vendors";
import InvoiceTable from "@/components/invoiceTable";
import useAuth from "@/hooks/useAuth";
import {useRouter} from "next/router";

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  // {label: "Generate Bill", path: "/generate-bill"},
  {label: "Manage Invoices", path: "/manage-invoices"},
  {label: "Manage Vendors", path: "/manage-vendors"},
];

const Dashboard = () => {
  const [selectedNav, setSelectedNav] = useState<string>("/manage-invoices");
  const isAuthenticated = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return null; // Optionally, you can return a loading indicator
  }
  // const router = useRouter();

  const handleNavClick = (path: string) => {
    setSelectedNav(path);
    // router.push(path);
  };
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/");
  };

  return (
    <div className="h-screen  ">
      <nav className=" bg-gray-100  flex justify-between">
        <div className="px-4 py-6 flex-grow flex items-center">
          <h1
            onClick={() => handleNavClick("/")}
            className="text-black text-lg font-bold mr-3 cursor-pointer"
          >
            Dashboard
          </h1>
          <ul className="flex">
            {navItems.map((item) => (
              <li key={item.path} className="py-2">
                <button
                  className={`text-black  hover:text-red-400 block px-2 text-sm text-left ${
                    selectedNav === item.path
                      ? " text-red-400 hover:text-red-400 underline"
                      : ""
                  }`}
                  onClick={() => handleNavClick(item.path)}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          <button
            onClick={handleLogout}
            className="ml-auto bg-rose-200 hover:bg-rose-500 px-3 py-1 rounded-md"
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="flex-grow p-4 overflow-auto">
        {/* {selectedNav === "/generate-bill" && <BillForm />} */}
        {selectedNav === "/manage-vendors" && <VendorTable />}
        {selectedNav === "/manage-invoices" && <InvoiceTable />}
        {selectedNav === "/" && ( // Welcome content for root path
          <InvoiceTable />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
