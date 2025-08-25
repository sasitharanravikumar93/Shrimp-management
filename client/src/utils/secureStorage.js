/**
 * Secure Storage Utilities
 * Provides secure alternatives to localStorage for sensitive data
 */

// Simple encryption/decryption using Web Crypto API where available
class SecureStorage {
  constructor() {
    this.isSupported = this.checkSupport();
    this.keyPromise = this.isSupported ? this.generateKey() : null;
  }

  checkSupport() {
    return (
      typeof window !== 'undefined' && window.crypto && window.crypto.subtle && window.localStorage
    );
  }

  async generateKey() {
    try {
      // Try to get existing key from localStorage
      const existingKey = localStorage.getItem('_app_key');
      if (existingKey) {
        const keyData = JSON.parse(existingKey);
        return await window.crypto.subtle.importKey(
          'raw',
          new Uint8Array(keyData),
          { name: 'AES-GCM' },
          false,
          ['encrypt', 'decrypt']
        );
      }

      // Generate new key
      const key = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
        'encrypt',
        'decrypt'
      ]);

      // Export and store key for persistence
      const keyData = await window.crypto.subtle.exportKey('raw', key);
      localStorage.setItem('_app_key', JSON.stringify(Array.from(new Uint8Array(keyData))));

      return key;
    } catch (error) {
      console.error('Failed to generate encryption key:', error);
      return null;
    }
  }

  async encrypt(data) {
    if (!this.isSupported || !this.keyPromise) {
      return btoa(JSON.stringify(data)); // Fallback to base64
    }

    try {
      const key = await this.keyPromise;
      if (!key) return btoa(JSON.stringify(data));

      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encodedData = new TextEncoder().encode(JSON.stringify(data));

      const encrypted = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encodedData
      );

      const result = {
        data: Array.from(new Uint8Array(encrypted)),
        iv: Array.from(iv)
      };

      return btoa(JSON.stringify(result));
    } catch (error) {
      console.error('Encryption failed:', error);
      return btoa(JSON.stringify(data)); // Fallback
    }
  }

  async decrypt(encryptedData) {
    if (!this.isSupported || !this.keyPromise) {
      try {
        return JSON.parse(atob(encryptedData)); // Fallback from base64
      } catch {
        return null;
      }
    }

    try {
      const key = await this.keyPromise;
      if (!key) {
        return JSON.parse(atob(encryptedData));
      }

      const { data, iv } = JSON.parse(atob(encryptedData));

      const decrypted = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: new Uint8Array(iv) },
        key,
        new Uint8Array(data)
      );

      const decodedData = new TextDecoder().decode(decrypted);
      return JSON.parse(decodedData);
    } catch (error) {
      console.error('Decryption failed:', error);
      try {
        return JSON.parse(atob(encryptedData)); // Fallback
      } catch {
        return null;
      }
    }
  }

  async setItem(key, value, options = {}) {
    const { encrypt = false, expiry = null } = options;

    try {
      let dataToStore = value;

      if (expiry) {
        dataToStore = {
          value,
          expiry: Date.now() + expiry
        };
      }

      const serializedData = encrypt
        ? await this.encrypt(dataToStore)
        : JSON.stringify(dataToStore);

      if (encrypt) {
        sessionStorage.setItem(`secure_${key}`, serializedData);
      } else {
        localStorage.setItem(key, serializedData);
      }

      return true;
    } catch (error) {
      console.error('Failed to store data:', error);
      return false;
    }
  }

  async getItem(key, options = {}) {
    const { encrypted = false } = options;

    try {
      const storageKey = encrypted ? `secure_${key}` : key;
      const storage = encrypted ? sessionStorage : localStorage;
      const stored = storage.getItem(storageKey);

      if (!stored) return null;

      const data = encrypted ? await this.decrypt(stored) : JSON.parse(stored);

      // Check expiry
      if (data && typeof data === 'object' && data.expiry) {
        if (Date.now() > data.expiry) {
          this.removeItem(key, { encrypted });
          return null;
        }
        return data.value;
      }

      return data;
    } catch (error) {
      console.error('Failed to retrieve data:', error);
      return null;
    }
  }

  removeItem(key, options = {}) {
    const { encrypted = false } = options;

    try {
      const storageKey = encrypted ? `secure_${key}` : key;
      const storage = encrypted ? sessionStorage : localStorage;
      storage.removeItem(storageKey);
      return true;
    } catch (error) {
      console.error('Failed to remove data:', error);
      return false;
    }
  }

  clear(options = {}) {
    const { encrypted = false } = options;

    try {
      if (encrypted) {
        // Remove only secure items
        const keys = Object.keys(sessionStorage);
        keys.forEach(key => {
          if (key.startsWith('secure_')) {
            sessionStorage.removeItem(key);
          }
        });
      } else {
        localStorage.clear();
      }
      return true;
    } catch (error) {
      console.error('Failed to clear storage:', error);
      return false;
    }
  }
}

// Create singleton instance
const secureStorage = new SecureStorage();

// Convenience methods for different types of data
export const storage = {
  // For non-sensitive data (theme, preferences, etc.)
  setPreference: (key, value, expiry = null) =>
    secureStorage.setItem(`pref_${key}`, value, { expiry }),

  getPreference: key => secureStorage.getItem(`pref_${key}`),

  removePreference: key => secureStorage.removeItem(`pref_${key}`),

  // For sensitive data (tokens, user data, etc.)
  setSecure: (
    key,
    value,
    expiry = 24 * 60 * 60 * 1000 // 24 hours default
  ) => secureStorage.setItem(key, value, { encrypt: true, expiry }),

  getSecure: key => secureStorage.getItem(key, { encrypted: true }),

  removeSecure: key => secureStorage.removeItem(key, { encrypted: true }),

  // For temporary data (session-based)
  setTemp: (
    key,
    value,
    expiry = 60 * 60 * 1000 // 1 hour default
  ) => secureStorage.setItem(`temp_${key}`, value, { expiry }),

  getTemp: key => secureStorage.getItem(`temp_${key}`),

  removeTemp: key => secureStorage.removeItem(`temp_${key}`),

  // Clear all data
  clearAll: () => {
    secureStorage.clear();
    secureStorage.clear({ encrypted: true });
  },

  // Clear only secure data
  clearSecure: () => secureStorage.clear({ encrypted: true })
};

// Migration helper for existing localStorage usage
export const migrateFromLocalStorage = async (key, isSecure = false) => {
  try {
    const existing = localStorage.getItem(key);
    if (existing) {
      const value = JSON.parse(existing);

      if (isSecure) {
        await storage.setSecure(key, value);
      } else {
        await storage.setPreference(key, value);
      }

      localStorage.removeItem(key);
      return true;
    }
  } catch (error) {
    console.error('Migration failed for key:', key, error);
  }
  return false;
};

export default storage;
