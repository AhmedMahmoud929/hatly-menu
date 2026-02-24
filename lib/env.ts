import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  // Optional for public routes; required when using auth (getJwtSecret() will throw)
  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET must be at least 32 characters for security")
    .optional(),
});

export type Env = z.infer<typeof envSchema>;

let cached: Env | null = null;

/** Lazy-validated env; use this in server code (API routes, auth, db). Fails on first use if invalid. */
export function getEnv(): Env {
  if (cached) return cached;
  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
  });
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Invalid environment: ${issues}`);
  }
  cached = parsed.data;
  return cached;
}
