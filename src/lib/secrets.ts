import { readFile } from "node:fs/promises";
import { join } from "node:path";

export enum SecretName {
  EmailAccessToken = "EMAIL_ACCESS_TOKEN",
  EmailPubToken = "EMAIL_PUB_TOKEN",
  EmailServiceId = "EMAIL_SERVICE_ID",
  EmailTemplateId = "EMAIL_TEMPLATE_ID",
}

export class MissingSecretError extends Error {
  constructor(readonly secretName: SecretName) {
    super(`Missing secret: ${secretName}`);
    this.name = "MissingSecretError";
  }
}

const DEFAULT_SECRETS_DIR = "/run/secrets";
const CACHE_KEY: unique symbol = Symbol.for("iitoneloc.secrets");

type SecretCacheHost = typeof globalThis & {
  [CACHE_KEY]?: Map<SecretName, string>;
};

const host = globalThis as SecretCacheHost;
const cache = (host[CACHE_KEY] ??= new Map<SecretName, string>());

const FILE_NOT_FOUND_CODE = "ENOENT";

const isNotFoundError = (error: unknown): boolean =>
  error instanceof Error &&
  "code" in error &&
  error.code === FILE_NOT_FOUND_CODE;

const readSecretFile = async (name: SecretName): Promise<string> => {
  const directory = process.env.SECRETS_DIR ?? DEFAULT_SECRETS_DIR;
  try {
    const value = await readFile(join(directory, name), "utf8");
    return value.endsWith("\n") ? value.slice(0, -1) : value;
  } catch (error) {
    if (isNotFoundError(error)) return "";
    throw error;
  }
};

const readSecret = async (name: SecretName): Promise<string> => {
  const value = await readSecretFile(name);
  if (value) return value;
  const fallback =
    process.env.NODE_ENV === "production" ? undefined : process.env[name];
  if (fallback) return fallback;
  throw new MissingSecretError(name);
};

export const loadSecrets = async (): Promise<void> => {
  await Promise.all(
    Object.values(SecretName).map(async (name) =>
      cache.set(name, await readSecret(name))
    )
  );
};

export const getSecret = (name: SecretName): string => {
  const value = cache.get(name);
  if (value === undefined) throw new MissingSecretError(name);
  return value;
};
