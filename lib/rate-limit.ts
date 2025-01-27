const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

export async function rateLimit(ip: string) {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const limit = 30; // requests per window

  const current = rateLimitMap.get(ip) || { count: 0, timestamp: now };

  // Reset if outside window
  if (now - current.timestamp > windowMs) {
    current.count = 0;
    current.timestamp = now;
  }

  current.count++;
  rateLimitMap.set(ip, current);

  return {
    success: current.count <= limit
  };
} 