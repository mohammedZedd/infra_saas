import { z } from "zod"

/** Validates a properly formatted email address. */
export const emailSchema = z.string().email("Please enter a valid email address")

/** Validates a strong password: 8+ chars, uppercase, lowercase, digit, special char. */
export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character")

/** Validates a display name: 2–50 chars, letters/spaces/hyphens only. */
export const nameSchema = z
  .string()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be at most 50 characters")
  .regex(/^[a-zA-Z\s-]+$/, "Name may only contain letters, spaces, and hyphens")

/** Validates a project name: 3–50 chars, letters/digits/hyphens/underscores, starts with letter, no spaces. */
export const projectNameSchema = z
  .string()
  .min(3, "Project name must be at least 3 characters")
  .max(50, "Project name must be at most 50 characters")
  .regex(/^[a-zA-Z]/, "Project name must start with a letter")
  .regex(/^[a-zA-Z0-9_-]+$/, "Project name may only contain letters, digits, hyphens, and underscores")

/** Validates a CIDR block like 10.0.0.0/16. */
export const cidrSchema = z
  .string()
  .regex(
    /^(\d{1,3}\.){3}\d{1,3}\/(\d|[1-2]\d|3[0-2])$/,
    "Must be a valid CIDR block (e.g. 10.0.0.0/16)"
  )

/** Validates an AWS ARN format. */
export const arnSchema = z
  .string()
  .regex(
    /^arn:[a-z0-9\-]+:[a-z0-9\-]+:[a-z0-9\-]*:[0-9]{12}:.+$/,
    "Must be a valid AWS ARN"
  )

/** Validates a key-value tag pair. */
export const tagSchema = z.object({
  key: z.string().min(1, "Tag key is required").max(128, "Tag key must be at most 128 characters"),
  value: z.string().max(256, "Tag value must be at most 256 characters"),
})

/** Validates an AWS region code. */
export const awsRegionSchema = z.enum([
  "us-east-1",
  "us-east-2",
  "us-west-1",
  "us-west-2",
  "eu-west-1",
  "eu-west-2",
  "eu-west-3",
  "eu-central-1",
  "eu-north-1",
  "ap-southeast-1",
  "ap-southeast-2",
  "ap-northeast-1",
  "ap-northeast-2",
  "ap-south-1",
  "sa-east-1",
  "ca-central-1",
  "me-south-1",
  "af-south-1",
])

