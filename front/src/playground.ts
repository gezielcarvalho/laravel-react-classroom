/**
 * Playground - Write experimental code here to be tested
 * This file contains functions, classes, and utilities for testing and experimentation
 */

// Example utility functions
export const stringUtils = {
  capitalize: (str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  reverse: (str: string): string => {
    return str.split("").reverse().join("");
  },

  isPalindrome: (str: string): boolean => {
    const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, "");
    return cleaned === cleaned.split("").reverse().join("");
  },

  truncate: (str: string, maxLength: number): string => {
    return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
  },
};

// Example math utilities
export const mathUtils = {
  add: (a: number, b: number): number => a + b,

  multiply: (a: number, b: number): number => a * b,

  factorial: (n: number): number => {
    if (n < 0) throw new Error("Factorial of negative number is not defined");
    if (n === 0 || n === 1) return 1;
    return n * mathUtils.factorial(n - 1);
  },

  isPrime: (num: number): boolean => {
    if (num < 2) return false;
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) return false;
    }
    return true;
  },

  fibonacci: (n: number): number => {
    if (n < 0) throw new Error("Fibonacci of negative number is not defined");
    if (n <= 1) return n;
    return mathUtils.fibonacci(n - 1) + mathUtils.fibonacci(n - 2);
  },
};

// Example array utilities
export const arrayUtils = {
  unique: <T>(arr: T[]): T[] => {
    return Array.from(new Set(arr));
  },

  chunk: <T>(arr: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  },

  flatten: <T>(arr: (T | T[])[]): T[] => {
    return arr.reduce<T[]>((acc, val) => {
      return acc.concat(Array.isArray(val) ? arrayUtils.flatten(val) : val);
    }, []);
  },

  shuffle: <T>(arr: T[]): T[] => {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },
};

// Example class for testing
export class Calculator {
  private history: string[] = [];

  add(a: number, b: number): number {
    const result = a + b;
    this.history.push(`${a} + ${b} = ${result}`);
    return result;
  }

  subtract(a: number, b: number): number {
    const result = a - b;
    this.history.push(`${a} - ${b} = ${result}`);
    return result;
  }

  multiply(a: number, b: number): number {
    const result = a * b;
    this.history.push(`${a} × ${b} = ${result}`);
    return result;
  }

  divide(a: number, b: number): number {
    if (b === 0) {
      throw new Error("Division by zero is not allowed");
    }
    const result = a / b;
    this.history.push(`${a} ÷ ${b} = ${result}`);
    return result;
  }

  getHistory(): string[] {
    return [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}

// Example async utilities
export const asyncUtils = {
  delay: (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  },

  timeout: <T>(promise: Promise<T>, ms: number): Promise<T> => {
    return Promise.race([
      promise,
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Operation timed out")), ms)
      ),
    ]);
  },

  retry: async <T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delay: number = 1000
  ): Promise<T> => {
    let lastError: Error = new Error("Operation failed");

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        if (attempt === maxAttempts) break;
        await asyncUtils.delay(delay);
      }
    }

    throw new Error(lastError.message || "Operation failed after retries");
  },
};

// Example interfaces and types for testing
export interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  inStock: boolean;
}

export type UserRole = "admin" | "user" | "moderator";

export type ApiStatus = "loading" | "success" | "error";

// Example data generators
export const dataGenerators = {
  createUser: (overrides: Partial<User> = {}): User => ({
    id: Math.floor(Math.random() * 1000),
    name: "John Doe",
    email: "john@example.com",
    isActive: true,
    ...overrides,
  }),

  createProduct: (overrides: Partial<Product> = {}): Product => ({
    id: Math.random().toString(36).substr(2, 9),
    name: "Sample Product",
    price: 99.99,
    category: "Electronics",
    inStock: true,
    ...overrides,
  }),

  createUsers: (count: number): User[] => {
    return Array.from({ length: count }, (_, index) =>
      dataGenerators.createUser({
        id: index + 1,
        name: `User ${index + 1}`,
        email: `user${index + 1}@example.com`,
      })
    );
  },
};

// Example validation utilities
export const validators = {
  isEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  isStrongPassword: (password: string): boolean => {
    // At least 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  },

  isPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  },

  isUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
};

// Example error classes
export class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ApiError extends Error {
  constructor(message: string, public statusCode: number) {
    super(message);
    this.name = "ApiError";
  }
}

// Example higher-order functions
export const funcUtils = {
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  memoize: <T extends (...args: any[]) => any>(func: T): T => {
    const cache = new Map();
    return ((...args: Parameters<T>) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        return cache.get(key);
      }
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },
};

/*
 * 🎯 PLAYGROUND USAGE:
 *
 * 1. Add your experimental functions, classes, and utilities above
 * 2. Import them in playground.test.ts to write tests
 * 3. Test different scenarios and edge cases
 * 4. Once stable, move to appropriate modules in your app
 *
 * 🚀 EXAMPLE IMPORTS FOR TESTS:
 * import { stringUtils, Calculator, validators } from '../playground';
 *
 * 📝 TIPS:
 * - Keep functions pure when possible (no side effects)
 * - Add TypeScript types and interfaces
 * - Test both happy path and error cases
 * - Experiment with different patterns and approaches
 */
