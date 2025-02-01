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

const Login = () => {
  const form = useForm()
  const onSubmit = (data: any) => {
    console.log(data);
  };

  return (
    <>
      <div className="w-full min-h-screen flex flex-col xl:flex-row justify-center items-center">
        {/* left side */}
        <div className="w-full xl:w-1/2 xl:h-screen flex flex-col sm:justify-center items-center  md:pt-12 p-5 ">
          <div className="flex flex-col w-full lg:h-full pt-10  bg-lime-50 rounded-3xl justify-end items-end ">
            <div className="w-5/6">
              <div className="flex flex-col sm:flex-row sm:space-x-8 space-y-4 sm:space-y-0">
                <div>
                  <img src="/public/flag.png" alt="logo" className="w-[60px] h-[40px]  lg:w-[80px] lg:h-[50px]"></img>
                </div>
                <div className="text-xl lg:text-2xl font-medium text-gray-900">
                  <h2>Welcome!<br/>
                    <span className="">Simplify your</span><br/> 
                    <span className="">loan management with easy.</span> <br/>
                    <span></span>
                  </h2>
                </div>

                
              </div>
              <div className="pt-4 md:pt-10">
                <img src="/public/dashbord.png" alt="dashbord" className="w-full h-[300px] md-h-[400px] lg:h-[550px] object-fit"></img>
              </div>
            </div>
          </div>
        </div>

        {/* right side*/}
        <div className="w-full xl:w-1/2 xl:min-h-screen flex justify-center items-center p-4">
          <div className="flex flex-col w-full h-full justify-center items-center">
            <div className="w-full flex flex-col items-center space-y-6 lg:space-y-8 mb-6 lg:mb-10">
              <img src="/public/flag.png" alt="logo" className="w-[60px] h-[40px] lg:w-[80px] lg:h-[50px]"></img>
              <div className="text-xl lg:text-2xl font-medium text-gray-900 text-center">
                <h2>Log in<br/>
                  <span className="">to manage your</span>  
                  <br/>
                  <span>loans and payments.</span>
                </h2>
              </div>
              <h2 className="text-sm lg:text-base text-gray-900">Let's sign you in</h2>
            </div>

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
                  <Button type="submit" className="w-full h-12 lg:h-14 bg-orange-600">Submit</Button>
                </form>
              </Form>
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