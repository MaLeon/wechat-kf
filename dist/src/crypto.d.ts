/**
 * WeCom message encryption/decryption
 *
 * - Signature: SHA1(sort([token, timestamp, nonce, encrypt]))
 * - Encryption: AES-256-CBC, key = Base64Decode(EncodingAESKey + "="), iv = key[0:16]
 * - Plaintext format: random(16B) + msg_len(4B network order) + msg + receiveid
 */
export declare function deriveAesKey(encodingAESKey: string): Buffer;
/** SHA1 signature verification */
export declare function computeSignature(token: string, timestamp: string, nonce: string, encrypt: string): string;
export declare function verifySignature(token: string, timestamp: string, nonce: string, encrypt: string, expectedSignature: string): boolean;
/** Decrypt an encrypted message from WeChat callback */
export declare function decrypt(encodingAESKey: string, encrypted: string): {
    message: string;
    receiverId: string;
};
/** Encrypt a message for WeChat callback response */
export declare function encrypt(encodingAESKey: string, message: string, receiverId: string): string;
