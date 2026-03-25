
export function safeStringify(input: unknown): string {
  try {
    return JSON.stringify(input)
  } catch {
    return String(input)
  }
}