import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { authService } from "../../services/authService";
import { formatDeviceInfo } from "../../utils/deviceId";
import "./LoginForm.css";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const LoginForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const deviceInfo = formatDeviceInfo();
      const response = await authService.login(
        data.email,
        data.password,
        deviceInfo,
      );

      toast.success("Login successful!");

      // Redirect based on role
      const user = response.user;
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "team_leader") {
        navigate("/leader");
      } else {
        navigate("/employee");
      }
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || "Login failed";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card card">
        <div className="login-header">
          <h1>Employee Tracker</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="label">
              Email Address
            </label>
            <input
              {...register("email")}
              id="email"
              type="email"
              className="input"
              placeholder="you@example.com"
              autoComplete="email"
            />
            {errors.email && (
              <p className="error-text">{errors.email.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="password" className="label">
              Password
            </label>
            <input
              {...register("password")}
              id="password"
              type="password"
              className="input"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            {errors.password && (
              <p className="error-text">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            className="btn btn-primary login-btn"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="login-footer">
          <p className="device-notice">
            ℹ️ You can only be logged in on one device at a time
          </p>
        </div>
      </div>
    </div>
  );
};
