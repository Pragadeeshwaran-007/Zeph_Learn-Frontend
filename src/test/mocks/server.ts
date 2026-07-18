import { setupServer } from "msw/node";
import { handlers } from "./handlers";

/**
 * MSW server for Vitest (Node environment).
 * Lifecycle is managed in src/test/setup.ts:
 *   beforeAll  → server.listen()
 *   afterEach  → server.resetHandlers()
 *   afterAll   → server.close()
 */
export const server = setupServer(...handlers);
