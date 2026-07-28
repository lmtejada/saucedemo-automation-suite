/**
 * Reads a required environment variable, throwing if it is unset or empty.
 *
 * @param name - The environment variable name to read.
 * @returns The environment variable's value.
 * @throws {Error} If the variable is not set.
 */
export function getEnv(name: string): string {
    const val = process.env[name];
    if (!val) throw new Error(`Environment variable ${name} is not set`);
    return val;
}
