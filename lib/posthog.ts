import "server-only";
import { PostHog } from "posthog-node";

let _client: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  const key = process.env.POSTHOG_KEY;
  if (!key) return null;

  if (!_client) {
    _client = new PostHog(key, {
      host: process.env.POSTHOG_HOST ?? "https://us.i.posthog.com",
      // Send each event immediately — important for serverless where the
      // function may freeze between requests and never flush a batch.
      flushAt: 1,
      flushInterval: 0,
    });
  }

  return _client;
}
