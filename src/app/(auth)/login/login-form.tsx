"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import DiamondRoundedIcon from "@mui/icons-material/DiamondRounded";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Collapse,
  Fade,
  IconButton,
  InputAdornment,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { loginAction } from "@/actions/login";
import { useLocale } from "@/shared/hooks/use-locale";
import { pharmacyGradients } from "@/shared/theme/mui-theme";
import { sapphireClinicalColors } from "@/theme/sapphire-clinical-colors";
import { LanguageSwitcher } from "@/components/layout/language-switcher";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { showError, showSuccess } from "@/shared/lib/toast";

const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const { messages } = useLocale();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [lastUsername, setLastUsername] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: true,
    },
  });

  useEffect(() => {
    const saved = window.localStorage.getItem("pharmacy-crm:last-username");
    if (saved) {
      setLastUsername(saved);
      setValue("username", saved);
    }
  }, [setValue]);

  const onSubmit = handleSubmit((values) => {
    const formData = new FormData();
    formData.set("username", values.username.trim());
    formData.set("password", values.password);
    formData.set("rememberMe", String(Boolean(values.rememberMe)));

    setServerError(null);

    startTransition(async () => {
      const result = await loginAction({}, formData);

      if (result.error) {
        setServerError(result.error);
        showError(result.error);
        return;
      }

      const signInResult = await signIn("credentials", {
        username: values.username.trim(),
        password: values.password,
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (signInResult?.error) {
        const message = messages.login.invalidCredentials;
        setServerError(message);
        showError(message);
        return;
      }

      if (values.rememberMe) {
        window.localStorage.setItem("pharmacy-crm:last-username", values.username.trim());
      } else {
        window.localStorage.removeItem("pharmacy-crm:last-username");
      }

      showSuccess(messages.login.welcomeBack);
      router.replace(signInResult?.url ?? "/dashboard");
      router.refresh();
    });
  });

  return (
    <Box sx={{ minHeight: "100vh", display: "flex" }}>
      {/* --------------------------------------------------------------- */}
      {/* Brand panel — the dark, gradient-lit cover treatment from the   */}
      {/* design system's title page, with the brand-flow gradient as an */}
      {/* ambient aurora instead of a flat fill.                          */}
      {/* --------------------------------------------------------------- */}
      <Box
        sx={{
          display: { xs: "none", md: "flex" },
          flex: "0 0 42%",
          position: "relative",
          overflow: "hidden",
          flexDirection: "column",
          justifyContent: "space-between",
          p: 6,
          color: sapphireClinicalColors.dark.text.primary,
          background: `linear-gradient(165deg, ${sapphireClinicalColors.dark.background.default} 0%, ${sapphireClinicalColors.dark.background.paper} 55%, ${sapphireClinicalColors.dark.background.elevated} 100%)`,
        }}
      >
        {/* aurora — a soft, slowly drifting wash of the brand gradient */}
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            top: "-20%",
            right: "-30%",
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: pharmacyGradients.brandFlow,
            filter: "blur(120px)",
            opacity: 0.4,
            animation: "auroraDrift 16s ease-in-out infinite",
            "@keyframes auroraDrift": {
              "0%, 100%": { transform: "translate(0, 0) scale(1)" },
              "50%": { transform: "translate(-6%, 8%) scale(1.08)" },
            },
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          }}
        />
        <Box
          aria-hidden
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: `radial-gradient(${alpha(sapphireClinicalColors.dark.text.primary, 0.08)} 1px, transparent 1px)`,
            backgroundSize: "22px 22px",
            maskImage: `linear-gradient(180deg, transparent, ${alpha(sapphireClinicalColors.dark.background.default, 0.6)} 40%, transparent 85%)`,
          }}
        />

        <Stack spacing={2.5} sx={{ position: "relative", zIndex: 1 }}>
          <Stack direction="row" spacing={1.75} sx={{ alignItems: "center" }}>
            <Avatar
              variant="rounded"
              sx={{
                width: 46,
                height: 46,
                borderRadius: 2.5,
                background: pharmacyGradients.brandFlow,
                boxShadow: `0 12px 28px -8px ${alpha(sapphireClinicalColors.brand.primary.main, 0.65)}`,
              }}
            >
              <DiamondRoundedIcon fontSize="small" />
            </Avatar>
            <Typography variant="h3" sx={{ fontWeight: 700, letterSpacing: "-0.01em" }}>
              {messages.common.appName}
            </Typography>
          </Stack>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 500,
              fontStyle: "italic",
              lineHeight: 1.4,
              maxWidth: 360,
              color: alpha(sapphireClinicalColors.dark.text.primary, 0.82),
            }}
          >
            {messages.login.brandSubtitle}
          </Typography>
        </Stack>

        <Typography
          variant="body2"
          sx={{
            position: "relative",
            zIndex: 1,
            color: alpha(sapphireClinicalColors.dark.text.primary, 0.62),
            borderTop: `1px solid ${alpha(sapphireClinicalColors.dark.text.primary, 0.14)}`,
            pt: 2.5,
            maxWidth: 380,
          }}
        >
          {messages.login.brandDescription}
        </Typography>
      </Box>

      {/* --------------------------------------------------------------- */}
      {/* Form panel — sits over the theme's ambient body wash, with the  */}
      {/* form itself presented as a Glass Card, the system's signature   */}
      {/* elevated surface.                                                */}
      {/* --------------------------------------------------------------- */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Stack direction="row" sx={{ justifyContent: "flex-end", alignItems: "center", gap: 0.5, p: { xs: 2, sm: 3 } }}>
          <LanguageSwitcher />
          <ThemeToggle />
        </Stack>

        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", px: { xs: 2.5, sm: 4 }, pb: 6 }}>
          <Fade in timeout={450}>
            <Card variant="glass" sx={{ width: "100%", maxWidth: 428, p: { xs: 3, sm: 5 } }}>
              {/* mobile-only brand mark, since the panel above is hidden here */}
              <Stack
                direction="row"
                spacing={1.5}
                sx={{ alignItems: "center", mb: 4, display: { xs: "flex", md: "none" } }}
              >
                <Avatar
                  variant="rounded"
                  sx={{ borderRadius: 2, width: 40, height: 40, background: pharmacyGradients.brandFlow }}
                >
                  <DiamondRoundedIcon fontSize="small" />
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {messages.common.appName}
                </Typography>
              </Stack>

              <Box component="form" onSubmit={onSubmit} noValidate>
                <Stack spacing={3}>
                  <Stack spacing={0.75}>
                    <Typography variant="h1">{messages.login.title}</Typography>
                    <Typography variant="body1" color="text.secondary">
                      {messages.login.subtitle}
                    </Typography>
                  </Stack>

                  <Stack spacing={2.25}>
                    <TextField
                      label={messages.login.username}
                      autoComplete="username"
                      autoFocus
                      fullWidth
                      placeholder={lastUsername || messages.login.placeholderUsername}
                      {...register("username")}
                      error={Boolean(errors.username)}
                      helperText={errors.username?.message}
                    />

                    <TextField
                      label={messages.login.password}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      fullWidth
                      placeholder="********"
                      {...register("password")}
                      error={Boolean(errors.password)}
                      helperText={errors.password?.message}
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                edge="end"
                                onClick={() => setShowPassword((value) => !value)}
                                aria-label={showPassword ? messages.common.hidePassword : messages.common.showPassword}
                              >
                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />

                    <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                      <Switch {...register("rememberMe")} defaultChecked />
                      <Typography variant="body2" color="text.secondary">
                        {messages.login.rememberMe}
                      </Typography>
                    </Stack>

                    <Collapse in={Boolean(serverError)} unmountOnExit>
                      <Alert severity="error" role="alert">
                        {serverError}
                      </Alert>
                    </Collapse>

                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      fullWidth
                      disabled={isPending}
                      endIcon={!isPending ? <ArrowForwardRoundedIcon /> : null}
                      sx={{ minHeight: 50, fontSize: 16 }}
                    >
                      {isPending ? (
                        <Stack direction="row" spacing={1.25} sx={{ alignItems: "center" }}>
                          <Box
                            sx={{
                              width: 16,
                              height: 16,
                              borderRadius: "50%",
                              border: "2px solid",
                              borderColor: (theme) => alpha(theme.palette.primary.contrastText, 0.4),
                              borderTopColor: "primary.contrastText",
                              animation: "spin 0.7s linear infinite",
                              "@keyframes spin": { to: { transform: "rotate(360deg)" } },
                            }}
                          />
                          <span>{messages.login.login}</span>
                        </Stack>
                      ) : (
                        messages.login.login
                      )}
                    </Button>
                  </Stack>
                </Stack>
              </Box>
            </Card>
          </Fade>
        </Box>
      </Box>
    </Box>
  );
}
