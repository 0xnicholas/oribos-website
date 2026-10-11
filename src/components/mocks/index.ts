/**
 * The host-interface mocks by kind (SPEC §3.5 brief ①–③) — one map so the home cards and the
 * use-case pages' header mocks render the same components (SPEC-revamp §5.1: reuse as-is).
 */
import MockChat from './MockChat.astro';
import MockThread from './MockThread.astro';
import MockTraceConsole from './MockTraceConsole.astro';

export const mockComponents = { chat: MockChat, thread: MockThread, console: MockTraceConsole };
