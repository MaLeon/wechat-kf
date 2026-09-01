/**
 * Markdown → Unicode text formatting
 *
 * Converts markdown bold/italic/bold-italic to Unicode Mathematical
 * Alphanumeric Symbols. Only converts ASCII letters (a-z, A-Z) and
 * digits (0-9) — other characters pass through unchanged.
 *
 * This is meant for plain-text surfaces like WeChat KF where
 * rich text / HTML isn't supported.
 */
/**
 * Convert markdown formatting to Unicode styled text.
 *
 * Handles:
 * - `***text***` or `___text___` → bold italic
 * - `**text**` or `__text__` → bold
 * - `*text*` or `_text_` → italic
 * - `` `code` `` → left as-is (backtick preserved)
 * - ``` code blocks ``` → left as-is
 * - `# headings` → 𝗛𝗲𝗮𝗱𝗶𝗻𝗴 (bold, # stripped)
 * - `- list items` / `* list items` → • item
 * - `1. numbered` → 1. (kept)
 * - `[text](url)` → text (url)
 * - `~~strikethrough~~` → stripped markers (no unicode strikethrough that's reliable)
 */
export declare function markdownToUnicode(text: string): string;
