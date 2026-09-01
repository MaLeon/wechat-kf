/**
 * File-system utilities — atomic write via temp file + rename.
 *
 * On POSIX systems, `rename()` within the same filesystem is atomic,
 * so the target file is never left in a partially-written state.
 */
export declare function atomicWriteFile(filePath: string, content: string, encoding?: BufferEncoding): Promise<void>;
