import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { authService } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from "@/hooks/use-toast"

// Clear potentially invalid authentication tokens
if (localStorage.getItem('token')) {
  try {
    // Only keep token if it's valid JWT format
    const token = localStorage.getItem('token');
    const parts = token?.split('.');
    if (!parts || parts.length !== 3) {
      console.warn("Removing invalid token format");
      localStorage.removeItem('token');
    }
  } catch (e) {
    console.warn("Error parsing token, removing it");
    localStorage.removeItem('token');
  }
}

const formSchema = z.object({
  username: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

// Admin credentials - hardcoded
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "admin";

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();
  const { toast } = useToast();

  // Check if user is already logged in and redirect if needed
  useEffect(() => {
    console.log("🔎 Login component mounted - checking for existing session");
    const token = localStorage.getItem('token');
    
    if (!token) {
      console.log("❌ No token found, staying on login page");
      return;
    }
    
    const checkAuth = async () => {
      console.log("🔄 Checking existing authentication");
      try {
         // Special case for admin token
         if (token === "admin-mock-token") {
          console.log("✅ Admin already authenticated");
          console.log("🧭 Redirecting to admin dashboard");
          navigate("/admin", { replace: true });
          return;
        }

        const user = await authService.getCurrentUser();
        console.log("✅ User already authenticated:", user);
        
        // Navigate based on role with replace to avoid history stack issues
        if (user.role === "borrower") {
          console.log("🧭 Redirecting to borrower dashboard");
          navigate("/borrower", { replace: true });
        } else if (user.role === "lender") {
          console.log("🧭 Redirecting to lender dashboard");
          navigate("/lender", { replace: true });
        } else if (user.role === "admin") {
          console.log("🧭 Redirecting to admin dashboard");
          navigate("/admin", { replace: true });
        } else {
          console.warn('⚠️ Unknown user role:', user.role);
        }
      } catch (error) {
        console.error("❌ Authentication check error:", error);
        localStorage.removeItem('token');
      }
    };
    
    checkAuth();
  }, [navigate]);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check for admin credentials
      if (data.username === ADMIN_EMAIL && data.password === ADMIN_PASSWORD) {
        console.log("✅ Admin login detected");
        
        // Create a mock token for admin
        const adminToken = "admin-mock-token";
        localStorage.setItem('token', adminToken);
        
        // Create a mock admin user in the auth context
        await login(adminToken, {
          id: "admin-id",
          email: ADMIN_EMAIL,
          role: "admin",
          full_name: "System Administrator",
          is_active: true
        });
        
         // Show success toast notification
         toast({
          title: "Admin Login Successful",
          description: "Welcome to the admin dashboard!",
          variant: "default",
        });

        // Navigate to admin dashboard
        navigate("/admin", { replace: true });
        return;
      }
      
      // Regular user login flow
      // 1. Login and get token
      const response = await authService.login(data.username, data.password);
      
      // 2. Use the auth context's login function which updates auth state
      await login(response.access_token);
      
      // 3. Fetch user profile
      const userProfile = await authService.getCurrentUser();
      
      // 4. Redirect based on role
      if (userProfile.role === "borrower") {
        navigate("/borrower", { replace: true });
      } else if (userProfile.role === "lender") {
        navigate("/lender", { replace: true });
      } else if (userProfile.role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/");
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <>
      <div className="w-full min-h-screen flex flex-col xl:flex-row justify-center items-center">
        {/* left side */}
        <div className="w-full xl:w-1/2 xl:h-screen flex flex-col sm:justify-center items-center  md:pt-12 p-5 ">
          <div className="flex flex-col w-full lg:h-full pt-10  bg-blue-50 rounded-3xl justify-end items-end ">
            <div className="w-5/6">
              <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-4 sm:space-y-0">
                <div>
                  <img src="/src/assets/logo.png" alt="logo" className="w-[60px] h-[40px]  lg:w-[180px] lg:h-[80px]"></img>
                </div>
                <div className="text-xl lg:text-2xl font-medium text-gray-900">
                  <h2>Welcome!<br/>
                    <span className="">Simplify your</span><br/> 
                    <span className="">loan management with ease.</span> <br/>
                    <span></span>
                  </h2>
                </div>
              </div>
              <div className="pt-4 md:pt-10">
                <img src="/src/assets/lopic.png" alt="dashbord" className="rounded-2xl w-full h-[300px] md:h-[350px] lg:h-[450px] object-cover"></img>
              </div>
            </div>
          </div>
        </div>

        {/* right side*/}
        <div className="w-full xl:w-1/2 xl:min-h-screen flex justify-center items-center p-4">
          <div className="flex flex-col w-full h-full justify-center items-center">
            <div className="w-full flex flex-col items-center space-y-6 lg:space-y-8 mb-6 lg:mb-10">
              <img src="/src/assets/logo.png" alt="logo" className="w-[60px] h-[40px] lg:w-[180px] lg:h-[80px]"></img>
              <div className="text-xl lg:text-2xl font-medium text-gray-900 text-center">
                <h2>Log in<br/>
                  <span className="">to manage your</span>  
                  <br/>
                  <span>loans and payments.</span>
                </h2>
              </div>
              <h2 className="text-sm lg:text-base text-gray-900">Let's sign you in</h2>
            </div>

            {error && (
              <div className="w-full px-4 sm:w-3/4 lg:w-1/2 mb-4">
                <div className="bg-red-50 text-red-500 p-3 rounded text-sm">
                  {error}
                </div>
              </div>
            )}

            <div className="w-full px-4 sm:w-3/4 lg:w-1/2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 lg:space-y-6">
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Email Address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input type="password" placeholder="Password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-center items-center">
                    <a href="#" className="text-sm text-blue-500">Forgot password?</a>
                  </div>
                  <Button type="submit" className="w-full h-12 lg:h-14 bg-blue-600" disabled={isLoading}>
                    {isLoading ? "Logging in..." : "Submit"}
                  </Button>
                </form>
              </Form>

               {/* Admin login button */}
               <div className="mt-4">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={() => {
                    form.setValue('username', ADMIN_EMAIL);
                    form.setValue('password', ADMIN_PASSWORD);
                    setTimeout(() => {
                      form.handleSubmit(onSubmit)();
                    }, 100);
                  }}
                >
                  Admin Login
                </Button>
              </div>
            </div>
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account? <a href="/register" className="text-blue-500 hover:text-blue-700">Register</a>
              </p>
            </div>
            <div className="mt-20 lg:mt-36 text-[8px] sm:text-xs">
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Login
