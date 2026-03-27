import { z, type ZodObject, type ZodRawShape } from "zod";

type EnvRecord = Record<string, unknown>;

type ParseEnvOptions<TSchema extends ZodRawShape> = {
  context: string;
  runtimeEnv: EnvRecord;
  schema: ZodObject<TSchema>;
};

export function parseEnv<TSchema extends ZodRawShape>({
  context,
  runtimeEnv,
  schema,
}: ParseEnvOptions<TSchema>): z.infer<ZodObject<TSchema>> {
  const parsed = schema.safeParse(runtimeEnv);

  if (parsed.success) {
    return parsed.data;
  }

  const issues = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("\n");

  throw new Error(`[${context}] Invalid environment configuration\n${issues}`);
}
