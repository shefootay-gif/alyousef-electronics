import { sign } from "hono/jwt";
import { env } from "../lib/env";
import { upsertUser, findUserByEmail } from "../queries/users";

export const createGoogleAuthUrl = (origin: string) => {
  const redirectUri = `${origin}/api/auth/google/callback`;
  const params = new URLSearchParams({
    client_id: env.googleClientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "email profile",
    access_type: "online",
    prompt: "consent"
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
};

export const handleGoogleCallback = async (code: string, origin: string) => {
  if (!env.googleClientId || !env.googleClientSecret) {
    throw new Error("Google OAuth credentials are not configured.");
  }

  const redirectUri = `${origin}/api/auth/google/callback`;

  // Exchange code for token
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      code,
      client_id: env.googleClientId,
      client_secret: env.googleClientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }).toString(),
  });

  const tokenData = await tokenResponse.json() as any;
  if (tokenData.error) {
    throw new Error(tokenData.error_description || "Failed to exchange token");
  }

  // Fetch user profile
  const userResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  });

  const userData = await userResponse.json() as any;
  if (userData.error) {
    throw new Error("Failed to fetch user profile");
  }

  const unionId = `google_${userData.id}`;
  
  // Upsert user into DB
  await upsertUser({
    unionId,
    email: userData.email,
    name: userData.name,
    avatar: userData.picture,
  });

  const dbUser = await findUserByEmail(userData.email);

  if (!dbUser) {
    throw new Error("Failed to sync user data");
  }

  // Create JWT
  const payload = {
    sub: dbUser.id.toString(),
    unionId: dbUser.unionId,
    role: dbUser.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
  };

  const jwt = await sign(payload, env.appSecret);
  return jwt;
};
