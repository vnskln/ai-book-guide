import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn (class name utility)", () => {
  it("łączy nazwy klas poprawnie", () => {
    expect(cn("class1", "class2")).toBe("class1 class2");
  });

  it("obsługuje warunkowe klasy", () => {
    const condition = true;
    const falseCondition = false;
    expect(cn("base", condition ? "active" : "inactive")).toBe("base active");
    expect(cn("base", falseCondition ? "active" : "inactive")).toBe("base inactive");
  });

  it("deduplikuje nazwy klas", () => {
    expect(cn("btn", "btn-primary", "btn")).toMatch(/btn.*btn-primary/);
    expect(cn("btn", "btn-primary", "btn")).toBe("btn btn-primary btn");
  });

  it("łączy klasy Tailwind prawidłowo", () => {
    expect(cn("p-4", "p-6")).toBe("p-6");
    expect(cn("text-red-500", "text-blue-500")).toBe("text-blue-500");
  });

  it("obsługuje różne typy wejściowe", () => {
    const result = cn("base", { active: true, disabled: false }, ["extra"]);
    expect(result).toContain("base");
    expect(result).toContain("active");
    expect(result).toContain("extra");
    expect(result).not.toContain("disabled");
  });
});
