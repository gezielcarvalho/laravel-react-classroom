/**
 * Jest Playground - Test various Jest features and patterns
 * This file is for experimentation and learning Jest testing patterns
 */

// Import your playground functions to test them
import {
  stringUtils,
  mathUtils,
  arrayUtils,
  Calculator,
  asyncUtils,
  dataGenerators,
  validators,
  ValidationError,
} from "../playground";

describe("Jest Playground", () => {
  // Basic test structure
  it("should demonstrate basic Jest assertions", () => {
    const message = "Hello Jest!";
    expect(message).toBe("Hello Jest!");
    expect(message).toContain("Jest");
    expect(message.length).toBeGreaterThan(5);
  });

  // Testing objects and arrays
  it("should test objects and arrays", () => {
    const user = { id: 1, name: "John", email: "john@test.com" };
    expect(user).toEqual({ id: 1, name: "John", email: "john@test.com" });
    expect(user).toHaveProperty("email");

    const numbers = [1, 2, 3, 4, 5];
    expect(numbers).toHaveLength(5);
    expect(numbers).toContain(3);
  });

  // Testing async functions
  it("should test async operations", async () => {
    const asyncFunction = () => Promise.resolve("async result");
    const result = await asyncFunction();
    expect(result).toBe("async result");
  });

  // Testing with mock functions
  it("should demonstrate mock functions", () => {
    const mockFn = jest.fn();
    mockFn("test argument");

    expect(mockFn).toHaveBeenCalled();
    expect(mockFn).toHaveBeenCalledWith("test argument");
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  // Testing with timers
  it("should test timers", () => {
    jest.useFakeTimers();
    const callback = jest.fn();

    setTimeout(callback, 1000);
    jest.advanceTimersByTime(1000);

    expect(callback).toHaveBeenCalled();
    jest.useRealTimers();
  });

  // Testing error handling
  it("should test error throwing", () => {
    const throwError = () => {
      throw new Error("Test error");
    };

    expect(throwError).toThrow("Test error");
    expect(throwError).toThrow(Error);
  });

  // Group related tests
  describe("Math operations", () => {
    it("should add numbers correctly", () => {
      expect(2 + 2).toBe(4);
    });

    it("should multiply numbers correctly", () => {
      expect(3 * 4).toBe(12);
    });
  });

  // Setup and teardown
  describe("Setup and teardown example", () => {
    let testData: any;

    beforeEach(() => {
      testData = { value: 0 };
    });

    afterEach(() => {
      testData = null;
    });

    it("should have initial test data", () => {
      expect(testData.value).toBe(0);
    });

    it("should be able to modify test data", () => {
      testData.value = 42;
      expect(testData.value).toBe(42);
    });
  });

  // Skip tests when needed
  it.skip("should skip this test", () => {
    // This test will be skipped
    expect(true).toBe(false);
  });

  // Focus on specific tests during development
  // it.only('should only run this test', () => {
  //   expect(true).toBe(true);
  // });
});

// Testing TypeScript-specific features
describe("TypeScript Features Playground", () => {
  interface TestUser {
    id: number;
    name: string;
    isActive: boolean;
  }

  it("should work with TypeScript interfaces", () => {
    const user: TestUser = {
      id: 1,
      name: "Test User",
      isActive: true,
    };

    expect(typeof user.id).toBe("number");
    expect(typeof user.name).toBe("string");
    expect(typeof user.isActive).toBe("boolean");
  });

  it("should test type assertions", () => {
    const value: unknown = "hello world";
    const stringValue = value as string;

    expect(stringValue.toUpperCase()).toBe("HELLO WORLD");
  });
});

// Utility functions for your playground
const playgroundUtils = {
  createMockUser: (overrides: Partial<{ id: number; name: string }> = {}) => ({
    id: 1,
    name: "Default User",
    ...overrides,
  }),

  delay: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  randomNumber: (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min,
};

describe("Playground Utilities", () => {
  it("should create mock users", () => {
    const user = playgroundUtils.createMockUser({ name: "Custom User" });
    expect(user.name).toBe("Custom User");
    expect(user.id).toBe(1);
  });

  it("should generate random numbers", () => {
    const num = playgroundUtils.randomNumber(1, 10);
    expect(num).toBeGreaterThanOrEqual(1);
    expect(num).toBeLessThanOrEqual(10);
  });
});

/*
 * 🎯 PLAYGROUND TIPS:
 *
 * 1. Add your experimental tests above
 * 2. Use describe() to group related tests
 * 3. Use it.skip() to temporarily disable tests
 * 4. Use it.only() to focus on specific tests during development
 * 5. Test your TypeScript types and interfaces here
 * 6. Experiment with different Jest matchers and patterns
 *
 * 🚀 COMMON JEST MATCHERS:
 * - toBe() - exact equality
 * - toEqual() - deep equality
 * - toContain() - array/string contains value
 * - toHaveProperty() - object has property
 * - toThrow() - function throws error
 * - toHaveBeenCalled() - mock function was called
 * - toBeNull(), toBeUndefined(), toBeTruthy(), toBeFalsy()
 *
 * 📚 ASYNC TESTING:
 * - Use async/await with async functions
 * - Use resolves/rejects for promise testing
 * - Mock timers with jest.useFakeTimers()
 */

// ================================
// PLAYGROUND FUNCTION TESTS
// ================================

describe("Playground Functions", () => {
  describe("stringUtils", () => {
    it("should capitalize strings", () => {
      expect(stringUtils.capitalize("hello")).toBe("Hello");
      expect(stringUtils.capitalize("WORLD")).toBe("WORLD");
      expect(stringUtils.capitalize("")).toBe("");
    });

    it("should reverse strings", () => {
      expect(stringUtils.reverse("hello")).toBe("olleh");
      expect(stringUtils.reverse("abc")).toBe("cba");
      expect(stringUtils.reverse("")).toBe("");
    });

    it("should check palindromes", () => {
      expect(stringUtils.isPalindrome("racecar")).toBe(true);
      expect(stringUtils.isPalindrome("A man a plan a canal Panama")).toBe(
        true
      );
      expect(stringUtils.isPalindrome("hello")).toBe(false);
    });

    it("should truncate strings", () => {
      expect(stringUtils.truncate("Hello World", 5)).toBe("Hello...");
      expect(stringUtils.truncate("Hi", 10)).toBe("Hi");
    });
  });

  describe("mathUtils", () => {
    it("should add numbers", () => {
      expect(mathUtils.add(2, 3)).toBe(5);
      expect(mathUtils.add(-1, 1)).toBe(0);
    });

    it("should calculate factorial", () => {
      expect(mathUtils.factorial(5)).toBe(120);
      expect(mathUtils.factorial(0)).toBe(1);
      expect(() => mathUtils.factorial(-1)).toThrow(
        "Factorial of negative number is not defined"
      );
    });

    it("should check prime numbers", () => {
      expect(mathUtils.isPrime(2)).toBe(true);
      expect(mathUtils.isPrime(17)).toBe(true);
      expect(mathUtils.isPrime(4)).toBe(false);
      expect(mathUtils.isPrime(1)).toBe(false);
    });
  });

  describe("arrayUtils", () => {
    it("should return unique values", () => {
      expect(arrayUtils.unique([1, 2, 2, 3, 3, 4])).toEqual([1, 2, 3, 4]);
      expect(arrayUtils.unique(["a", "b", "a", "c"])).toEqual(["a", "b", "c"]);
    });

    it("should chunk arrays", () => {
      expect(arrayUtils.chunk([1, 2, 3, 4, 5], 2)).toEqual([
        [1, 2],
        [3, 4],
        [5],
      ]);
      expect(arrayUtils.chunk([1, 2, 3], 5)).toEqual([[1, 2, 3]]);
    });

    it("should flatten arrays", () => {
      expect(arrayUtils.flatten([1, [2, 3], [4, [5]]])).toEqual([
        1, 2, 3, 4, 5,
      ]);
    });

    it("should shuffle arrays", () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = arrayUtils.shuffle(original);
      expect(shuffled).toHaveLength(5);
      expect(shuffled).toEqual(expect.arrayContaining(original));
      expect(original).toEqual([1, 2, 3, 4, 5]); // Original unchanged
    });
  });

  describe("Calculator class", () => {
    let calc: Calculator;

    beforeEach(() => {
      calc = new Calculator();
    });

    it("should perform basic operations", () => {
      expect(calc.add(2, 3)).toBe(5);
      expect(calc.subtract(5, 2)).toBe(3);
      expect(calc.multiply(3, 4)).toBe(12);
      expect(calc.divide(10, 2)).toBe(5);
    });

    it("should throw error on division by zero", () => {
      expect(() => calc.divide(5, 0)).toThrow(
        "Division by zero is not allowed"
      );
    });

    it("should track calculation history", () => {
      calc.add(2, 3);
      calc.multiply(4, 5);
      const history = calc.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0]).toContain("2 + 3 = 5");
      expect(history[1]).toContain("4 × 5 = 20");
    });

    it("should clear history", () => {
      calc.add(1, 1);
      calc.clearHistory();
      expect(calc.getHistory()).toHaveLength(0);
    });
  });

  describe("asyncUtils", () => {
    it("should delay execution", async () => {
      const start = Date.now();
      await asyncUtils.delay(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90); // Allow some tolerance
    });

    it("should timeout promises", async () => {
      const slowPromise = new Promise((resolve) => setTimeout(resolve, 200));
      await expect(asyncUtils.timeout(slowPromise, 100)).rejects.toThrow(
        "Operation timed out"
      );
    });

    it("should retry failed operations", async () => {
      let attempts = 0;
      const failingFunction = () => {
        attempts++;
        if (attempts < 3) {
          return Promise.reject(new Error("Not yet"));
        }
        return Promise.resolve("Success!");
      };

      const result = await asyncUtils.retry(failingFunction, 3, 10);
      expect(result).toBe("Success!");
      expect(attempts).toBe(3);
    });
  });

  describe("validators", () => {
    it("should validate emails", () => {
      expect(validators.isEmail("test@example.com")).toBe(true);
      expect(validators.isEmail("invalid-email")).toBe(false);
      expect(validators.isEmail("test@")).toBe(false);
    });

    it("should validate strong passwords", () => {
      expect(validators.isStrongPassword("Abc123@!")).toBe(true);
      expect(validators.isStrongPassword("password")).toBe(false);
      expect(validators.isStrongPassword("12345678")).toBe(false);
    });

    it("should validate URLs", () => {
      expect(validators.isUrl("https://example.com")).toBe(true);
      expect(validators.isUrl("http://localhost:3000")).toBe(true);
      expect(validators.isUrl("not-a-url")).toBe(false);
    });
  });

  describe("dataGenerators", () => {
    it("should create mock users", () => {
      const user = dataGenerators.createUser();
      expect(user).toHaveProperty("id");
      expect(user).toHaveProperty("name");
      expect(user).toHaveProperty("email");
      expect(user.isActive).toBe(true);
    });

    it("should create custom users", () => {
      const user = dataGenerators.createUser({ name: "Custom Name", age: 25 });
      expect(user.name).toBe("Custom Name");
      expect(user.age).toBe(25);
    });

    it("should create multiple users", () => {
      const users = dataGenerators.createUsers(3);
      expect(users).toHaveLength(3);
      expect(users[0].name).toBe("User 1");
      expect(users[2].name).toBe("User 3");
    });
  });

  describe("Error classes", () => {
    it("should create ValidationError", () => {
      const error = new ValidationError("Invalid input", "email");
      expect(error.message).toBe("Invalid input");
      expect(error.field).toBe("email");
      expect(error.name).toBe("ValidationError");
    });
  });
});
