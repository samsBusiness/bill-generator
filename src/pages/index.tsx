import {
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
  Card,
} from "@/components/ui/card";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {useState} from "react";
import axios from "axios";
import {useRouter} from "next/router";

export default function Home() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = () => {
    if (username.length == 0 || password.length == 0) {
      alert("Username or Password cannot be empty!");
      return;
    }
    setLoading(true);
    // console.log(username, password);
    axios
      .post(`/api/login`, {username: username, password: password})
      .then((res) => {
        if (res.status == 200) {
          router.push("/dashboard");
        }
      })
      .catch((err) => {
        console.error(err);
        alert("Unable to login, please check username and password again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="flex h-screen w-full items-center justify-center  dark:bg-gray-950">
      {loading ? (
        <>
          <h3>Logging you in</h3>
          <div className="bouncing-loader">
            <div></div>
            <div></div>
            <div></div>
          </div>
        </>
      ) : (
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your username and password to access your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                value={username}
                onChange={(val) => setUsername(val.target.value)}
                id="username"
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                value={password}
                onChange={(val) => setPassword(val.target.value)}
                id="password"
                placeholder="Enter your password"
                type="password"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={() => handleSubmit()} className="w-full">
              Login
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
