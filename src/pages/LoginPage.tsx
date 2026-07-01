import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { getApiErrorMessage } from "../api/client";
import { authService } from "../services/auth.service";
import { Button, FormError, Input, Logo } from "../ui/components";

const schema = z.object({
  userId: z.string().min(3, "Enter a valid user ID."),
  password: z.string().min(6, "Password must be at least 6 characters.")
});

type LoginValues = z.infer<typeof schema>;

export const LoginPage = () => {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginValues>({ resolver: zodResolver(schema), defaultValues: { userId: "", password: "" } });

  const onSubmit = async (values: LoginValues) => {
    setServerError("");
    try {
      await authService.login(values);
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (error) {
      const message = getApiErrorMessage(error, "We could not verify those credentials. Please try again.");
      setServerError(message);
      toast.error(message);
    }
  };

  return (
    <main className="grid min-h-screen min-w-80 overflow-x-hidden bg-[#f4f9ff] font-sans text-brand-ink grid-cols-[1fr_minmax(520px,710px)] max-[980px]:grid-cols-1">
      <section className="grid place-items-center p-9 max-[980px]:hidden" aria-hidden="true">
        <img className="h-auto w-[min(470px,74%)]" src="/assets/login-illustration.png" alt="" />
      </section>
      <section className="my-[18px] ml-0 mr-5 grid place-items-center rounded-[7px] border border-[#8bb0ff] bg-white max-[980px]:m-4 max-[980px]:min-h-[calc(100vh-32px)]">
        <form className="grid w-[min(510px,calc(100%_-_54px))] gap-5 max-[720px]:w-[calc(100%_-_32px)]" onSubmit={handleSubmit(onSubmit)}>
          <Logo className="w-[137px]" />
          <h1 className="mb-0 mt-4 text-[22px] font-bold">Login</h1>
          <p className="-mt-2 mb-3 text-[13px]">Use your company provided Login credentials</p>
          {serverError ? <div className="rounded-[7px] bg-[#fff0f2] px-3.5 py-3 font-semibold text-[#bb2735]">{serverError}</div> : null}
          <Input label="User ID" placeholder="Enter User ID" error={errors.userId?.message} {...register("userId")} />
          <Input
            label="Password"
            placeholder="Enter Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
          <a href="#forgot" className="text-sm text-[#0b55ff] no-underline">
            Forgot password?
          </a>
          <FormError message={errors.root?.message} />
          <Button type="submit" fullWidth isLoading={isSubmitting}>
            Login
          </Button>
        </form>
      </section>
    </main>
  );
};
