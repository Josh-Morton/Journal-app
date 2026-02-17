import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const ENCRYPTION_KEY_NAME = "encryptionKey";

// Generate a random encryption key
async function generateKey(): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    return Array.from(randomBytes)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

// Get or create the encryption key
async function getOrCreateKey(): Promise<string> {
    let key = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
    if (!key) {
        key = await generateKey();
        await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key);
    }
    return key;
}

// Simple XOR-based encryption (for MVP - can upgrade to AES later)
// Note: For production, use a proper AES library like react-native-aes-crypto
function xorEncrypt(text: string, key: string): string {
    const keyBytes = key.split("").map((c) => c.charCodeAt(0));
    const textBytes = text.split("").map((c) => c.charCodeAt(0));

    const encrypted = textBytes.map(
        (byte, i) => byte ^ keyBytes[i % keyBytes.length]
    );

    // Convert to base64-like string
    return btoa(String.fromCharCode(...encrypted));
}

function xorDecrypt(encrypted: string, key: string): string {
    const keyBytes = key.split("").map((c) => c.charCodeAt(0));
    const encryptedBytes = atob(encrypted)
        .split("")
        .map((c) => c.charCodeAt(0));

    const decrypted = encryptedBytes.map(
        (byte, i) => byte ^ keyBytes[i % keyBytes.length]
    );

    return String.fromCharCode(...decrypted);
}

// Encrypt a string
export async function encrypt(plaintext: string): Promise<string> {
    const key = await getOrCreateKey();
    return xorEncrypt(plaintext, key);
}

// Decrypt a string
export async function decrypt(ciphertext: string): Promise<string> {
    const key = await getOrCreateKey();
    return xorDecrypt(ciphertext, key);
}

// Encrypt an object (serialize to JSON first)
export async function encryptObject(obj: object): Promise<string> {
    const json = JSON.stringify(obj);
    return encrypt(json);
}

// Decrypt to an object
export async function decryptObject<T>(ciphertext: string): Promise<T> {
    const json = await decrypt(ciphertext);
    return JSON.parse(json) as T;
}

// Hash a string (for integrity checks)
export async function hash(text: string): Promise<string> {
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, text);
}
