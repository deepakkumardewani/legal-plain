export async function register() {
  if (process.env.NODE_ENV === "development") {
    const { warmRedisOnDevStartup } = await import("@/lib/redis");
    await warmRedisOnDevStartup();
  }
}
