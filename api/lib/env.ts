import "dotenv/config";

function optionalSecret(name: string): string | undefined {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value : undefined;
}

function requireProductionSecret(name: string): string {
  const secret = optionalSecret(name);

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`${name} is required in production`);
    }

    return "";
  }

  if (process.env.NODE_ENV === "production" && secret.length < 32) {
    throw new Error(`${name} must be at least 32 characters in production`);
  }

  return secret;
}

function resolveJwtSecret(): string {
  const secret = optionalSecret("JWT_SECRET") || optionalSecret("APP_SECRET");
  if (secret) {
    if (process.env.NODE_ENV === "production" && secret.length < 32) {
      throw new Error("JWT_SECRET or APP_SECRET must be at least 32 characters in production");
    }
    return secret;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET or APP_SECRET is required in production");
  }

  return "dev_only_super_secret_key_change_me";
}

function parseAllowedOrigins(): string[] {
  return (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim().toLowerCase())
    .filter(Boolean);
}

export const env = {
  jwtSecret: resolveJwtSecret(),
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: optionalSecret("DATABASE_URL"),
  ownerUnionId: process.env.OWNER_UNION_ID ?? "",
  googleClientId: process.env.GOOGLE_CLIENT_ID ?? "",
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
  paymentWebhookSecret: requireProductionSecret("PAYMENT_WEBHOOK_SECRET"),
  allowedOrigins: parseAllowedOrigins(),
};
