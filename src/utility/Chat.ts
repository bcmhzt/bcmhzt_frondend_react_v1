// src/utility/Chat.ts
export async function generateChatRoomId(uids: string[]): Promise<string> {
  const sorted = [...uids].sort();
  const joined = sorted.join('_');
  const encoder = new TextEncoder();
  const data = encoder.encode(joined);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

