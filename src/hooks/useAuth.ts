import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import {verifyToken} from "@/lib/utils";

const useAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const decoded = token ? verifyToken(token) : null;

    if (!decoded) {
      router.replace("/");
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  return isAuthenticated;
};

export default useAuth;
