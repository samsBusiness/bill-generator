import React, {useState} from "react";
import VendorTable from "@/components/vendors";
import BillForm from "@/components/billForm";

interface NavItem {
  label: string;
  path: string;
}

const navItems: NavItem[] = [
  {label: "Generate Bill", path: "/generate-bill"},
  {label: "Add Vendor", path: "/add-vendor"},
  {label: "Manage Invoices", path: "/manage-invoices"},
];

const Dashboard = () => {
  const [selectedNav, setSelectedNav] = useState<string>("/generate-bill");
  // const router = useRouter();

  const handleNavClick = (path: string) => {
    setSelectedNav(path);
    // router.push(path);
  };

  return (
    <div className="h-screen  ">
      <nav className=" bg-gray-100  flex justify-between">
        <div className="px-4 py-6 flex-grow flex items-center">
          <h1 className="text-black text-lg font-bold mr-3">Dashboard</h1>
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
        </div>
      </nav>
      <main className="flex-grow p-4 overflow-auto">
        {selectedNav === "/generate-bill" && <BillForm />}
        {selectedNav === "/add-vendor" && <VendorTable />}
        {selectedNav === "/manage-invoices" && <ManageInvoicesContent />}
        {selectedNav === "/" && ( // Welcome content for root path
          <BillForm />
        )}
      </main>
    </div>
  );
};

const ManageInvoicesContent = () => {
  // Content for managing invoices
  return (
    <div>
      <h1>Manage Invoice Records</h1>
      {/* Table or functionality for managing invoices */}
    </div>
  );
};

export default Dashboard;
