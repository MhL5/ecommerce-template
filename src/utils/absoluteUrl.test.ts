import { absoluteUrl } from "@/utils/absoluteUrl";
import { describe, expect, test } from "vitest";

describe("absoluteUrl", () => {
  describe("development mode", () => {
    test("should generate correct URL for root path", () => {
      const result = absoluteUrl("/");
      expect(result).toBe("http://localhost:3000");
    });

    test("should generate correct URL for simple path", () => {
      const result = absoluteUrl("/blogs");
      expect(result).toBe("http://localhost:3000/blogs");
    });

    test("should remove trailing slash", () => {
      const result = absoluteUrl("/blogs/");
      expect(result).toBe("http://localhost:3000/blogs");
    });

    test("should normalize duplicate slashes", () => {
      const result = absoluteUrl("/path//to//resource");
      expect(result).toBe("http://localhost:3000/path/to/resource");
    });

    test("should handle multiple consecutive slashes", () => {
      const result = absoluteUrl("///path/to/resource");
      expect(result).toBe("http://localhost:3000/path/to/resource");
    });

    test("should handle complex paths with multiple slashes", () => {
      const result = absoluteUrl("/api///v1//users///123");
      expect(result).toBe("http://localhost:3000/api/v1/users/123");
    });

    test("should handle paths with query parameters", () => {
      const result = absoluteUrl("/search?q=test&page=1");
      expect(result).toBe("http://localhost:3000/search?q=test&page=1");
    });

    test("should handle paths with hash fragments", () => {
      const result = absoluteUrl("/page#section");
      expect(result).toBe("http://localhost:3000/page#section");
    });

    test("should handle paths with both query and hash", () => {
      const result = absoluteUrl("/page?query=1#section");
      expect(result).toBe("http://localhost:3000/page?query=1#section");
    });
  });

  describe("edge cases", () => {
    test("should handle paths with encoded characters", () => {
      const result = absoluteUrl("/path%20with%20spaces");
      expect(result).toBe("http://localhost:3000/path%20with%20spaces");
    });

    test("should handle paths with special characters", () => {
      const result = absoluteUrl("/path-with-dashes_and_underscores");
      expect(result).toBe(
        "http://localhost:3000/path-with-dashes_and_underscores",
      );
    });
  });
});
