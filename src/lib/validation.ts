import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(5, "Enter your email address")
  .max(254)
  .email("Enter a valid email address")
  .transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(10, "Use at least 10 characters")
  .max(200, "That password is too long")
  .refine((value) => /[a-zA-Z]/.test(value) && /[0-9]/.test(value), {
    message: "Include at least one letter and one number",
  });

/**
 * Links must be absolute http(s) URLs. Zod's `.url()` alone accepts schemes
 * like `javascript:` or `data:`, which would be rendered straight into an
 * anchor tag, so the protocol is checked explicitly.
 */
export const httpUrlSchema = z
  .string()
  .trim()
  .max(500)
  .url("Enter a valid URL")
  .refine((value) => /^https?:\/\//i.test(value), { message: "Use an http:// or https:// link" });

export const optionalHttpUrlSchema = z.union([z.literal(""), httpUrlSchema]).default("");

export const signUpSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80, "Keep your name under 80 characters"),
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Enter your password").max(200),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(10),
    password: passwordSchema,
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name").max(80),
  email: emailSchema,
  subject: z.string().trim().max(120).optional().default(""),
  message: z.string().trim().min(20, "Tell us a little more (20+ characters)").max(4000, "Keep it under 4000 characters"),
  // Honeypot: real visitors never fill this hidden field.
  website: z.string().max(0).optional().default(""),
});

export const profileSchema = z.object({
  title: z.string().trim().min(2, "Add a portfolio title").max(90),
  headline: z.string().trim().max(160).default(""),
  bio: z.string().trim().max(1200).default(""),
  location: z.string().trim().max(90).default(""),
  email: z.union([z.literal(""), emailSchema]).default(""),
  phone: z.string().trim().max(40).default(""),
  availability: z.string().trim().max(120).default(""),
  avatarUrl: z.string().trim().max(500).default(""),
  coverUrl: z.string().trim().max(500).default(""),
});

export const appearanceSchema = z.object({
  template: z.enum(["signal", "monograph", "atlas", "terminal"]),
  accent: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Use a hex colour like #7DD3C0")
    .default("#7DD3C0"),
  fontStyle: z.enum(["sans", "serif", "mono"]).default("sans"),
  appearance: z.enum(["dark", "light"]).default("dark"),
});

export const portfolioSlugSchema = z
  .string()
  .trim()
  .min(3, "Use at least 3 characters")
  .max(40, "Keep the handle under 40 characters")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and single hyphens only");

export const projectSchema = z.object({
  name: z.string().trim().min(2, "Add a project name").max(90),
  slug: z
    .string()
    .trim()
    .max(60)
    .refine((value) => value === "" || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value), {
      message: "Use lowercase letters, numbers and hyphens",
    })
    .optional()
    .default(""),
  tagline: z.string().trim().max(160).default(""),
  description: z.string().trim().max(3000).default(""),
  category: z.enum([
    "ai-llm",
    "geoscience",
    "developer-tools",
    "web-applications",
    "data-science",
    "automation",
    "experimental",
  ]),
  status: z.enum(["live", "completed", "in-development", "experimental", "planned", "archived"]),
  progress: z.coerce.number().int().min(0).max(100).nullable().optional(),
  repoUrl: optionalHttpUrlSchema,
  demoUrl: optionalHttpUrlSchema,
  imageUrl: z.string().trim().max(500).default(""),
  stack: z.string().max(600).default(""),
  features: z.string().max(2000).default(""),
  problem: z.string().max(2000).default(""),
  contribution: z.string().max(2000).default(""),
  architecture: z.string().max(2000).default(""),
  featured: z.coerce.boolean().default(false),
  published: z.coerce.boolean().default(true),
});

export const experienceSchema = z.object({
  role: z.string().trim().min(2, "Add a role").max(90),
  organization: z.string().trim().min(2, "Add an organisation").max(120),
  startDate: z.string().trim().min(4, "Add a start date").max(20),
  endDate: z.string().trim().max(20).default(""),
  current: z.coerce.boolean().default(false),
  location: z.string().trim().max(90).default(""),
  summary: z.string().trim().max(1200).default(""),
  highlights: z.string().max(2000).default(""),
  tech: z.string().max(600).default(""),
});

export const educationSchema = z.object({
  degree: z.string().trim().min(2, "Add a degree").max(120),
  institution: z.string().trim().min(2, "Add an institution").max(140),
  year: z.string().trim().max(20).default(""),
  location: z.string().trim().max(90).default(""),
  detail: z.string().trim().max(1200).default(""),
});

export const certificationSchema = z.object({
  title: z.string().trim().min(2, "Add a title").max(140),
  issuer: z.string().trim().min(2, "Add an issuer").max(140),
  year: z.string().trim().max(20).default(""),
  url: optionalHttpUrlSchema,
  learning: z.coerce.boolean().default(false),
});

export const achievementSchema = z.object({
  title: z.string().trim().min(2, "Add a title").max(160),
  detail: z.string().trim().max(1200).default(""),
  year: z.string().trim().max(20).default(""),
  kind: z.enum(["certification", "hackathon", "scholarship", "award", "research", "publication", "membership", "other"]).default("award"),
});

export const socialLinkSchema = z.object({
  label: z.string().trim().min(2, "Add a label").max(40),
  url: httpUrlSchema,
});

export const skillSchema = z.object({
  name: z.string().trim().min(1, "Add a skill").max(60),
  group: z.string().trim().max(60).default("Core"),
  learning: z.coerce.boolean().default(false),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
