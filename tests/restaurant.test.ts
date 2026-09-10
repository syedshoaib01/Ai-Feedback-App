import { describe, it, expect } from "vitest";
import { getRestaurantConfig, RESTAURANT_REGISTRY, DEFAULT_RESTAURANT } from "@/lib/restaurant/config";

describe("Restaurant Configuration Architecture", () => {
  it("returns default restaurant when no slug is specified", () => {
    const config = getRestaurantConfig();
    expect(config.slug).toBe("default");
    expect(config.name).toBe("ReviewFlow");
  });

  it("retrieves pre-registered restaurant configuration", () => {
    const config = getRestaurantConfig("cafe-example");
    expect(config.slug).toBe("cafe-example");
    expect(config.name).toBe("The Roastery Café");
    expect(config.highlights?.length).toBeGreaterThan(0);
    expect(config.themeAccent).toBe("#d97706");
  });

  it("dynamically generates fallback configuration for new slugs", () => {
    const config = getRestaurantConfig("artisan-bakery-sf");
    expect(config.slug).toBe("artisan-bakery-sf");
    expect(config.name).toBe("Artisan Bakery Sf");
    expect(config.categories).toBeDefined();
    expect(config.highlights).toBeDefined();
  });
});
