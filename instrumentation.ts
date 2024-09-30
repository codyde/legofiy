import { initNodeSdk } from '@/lib/ld/server';

export async function register() {
  await initNodeSdk();
}
