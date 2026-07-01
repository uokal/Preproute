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
    <main className="login-page">
      <section className="login-art" aria-hidden="true">
        <img src="/assets/login-illustration.png" alt="" />
      </section>
      <section className="login-panel">
        <form className="login-form" onSubmit={handleSubmit(onSubmit)}>
          <Logo />
          <h1>Login</h1>
          <p>Use your company provided Login credentials</p>
          {serverError ? <div className="error-banner">{serverError}</div> : null}
          <Input label="User ID" placeholder="Enter User ID" error={errors.userId?.message} {...register("userId")} />
          <Input
            label="Password"
            placeholder="Enter Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />
          <a href="#forgot" className="forgot-link">
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
