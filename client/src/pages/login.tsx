import { useState } from "react";
import { Button, Card, CardBody, CardHeader, Input, Divider } from "@heroui/react";
import { ArrowRight, Terminal, User, Lock, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }

    try {
      // For now, simulate successful login
      // In a real app, this would call your authentication API
      console.log("Login attempt:", { username: formData.username, isLogin });
      
      // Clear logout flag and redirect to dashboard
      localStorage.removeItem('logout');
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Button
            variant="light"
            startContent={<ArrowLeft size={16} />}
            className="absolute top-6 left-6 font-mono"
            onClick={() => navigate('/')}
          >
            BACK TO HOME
          </Button>
          
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mb-4 mx-auto">
            <Terminal className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-mono font-bold text-gray-900 mb-2">
            MOBIUS ONE
          </h1>
          <p className="text-gray-600 font-mono">
            {isLogin ? "Welcome back to your AI Terminal" : "Create your AI Terminal account"}
          </p>
        </div>

        {/* Login/Signup Form */}
        <Card className="border border-gray-200 shadow-lg">
          <CardHeader className="pb-2">
            <h2 className="text-xl font-mono font-bold text-gray-900">
              {isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
            </h2>
          </CardHeader>
          <CardBody className="pt-0">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Username"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                startContent={<User className="text-gray-400" size={18} />}
                classNames={{
                  label: "font-mono font-bold text-gray-700",
                  input: "font-mono"
                }}
                required
              />

              <Input
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                startContent={<Lock className="text-gray-400" size={18} />}
                classNames={{
                  label: "font-mono font-bold text-gray-700",
                  input: "font-mono"
                }}
                required
              />

              {!isLogin && (
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  startContent={<Lock className="text-gray-400" size={18} />}
                  classNames={{
                    label: "font-mono font-bold text-gray-700",
                    input: "font-mono"
                  }}
                  required
                />
              )}

              <Button
                type="submit"
                color="primary"
                size="lg"
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-mono font-bold"
                endContent={<ArrowRight size={18} />}
                style={{ minHeight: '48px' }}
              >
                {isLogin ? "SIGN IN" : "CREATE ACCOUNT"}
              </Button>
            </form>

            <Divider className="my-6" />

            <div className="text-center">
              <p className="text-gray-600 font-mono text-sm mb-4">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
              </p>
              <Button
                variant="flat"
                color="primary"
                className="font-mono font-bold"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "CREATE ACCOUNT" : "SIGN IN"}
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Demo Notice */}
        <Card className="mt-6 bg-blue-50 border border-blue-200">
          <CardBody className="p-4">
            <div className="text-center">
              <p className="text-blue-800 font-mono text-sm font-bold mb-2">
                DEMO MODE
              </p>
              <p className="text-blue-700 text-xs">
                This is a demonstration. Use any username/password to access the system.
                In production, this would connect to your organization's authentication system.
              </p>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}