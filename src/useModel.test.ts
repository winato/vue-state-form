import { describe, it, expect } from "vitest";
import { useModel } from "./useModel";

describe("useModel", () => {
  it("sets nested field by path", () => {
    const form = useModel({
      name: "Adam",
      address: {
        city: "London",
      },
    });

    form.setField("address.city", "London");

    expect(form.getField("address.city")).toBe("London");
  });

  it("resets model to initial values", () => {
    const form = useModel({
      name: "Adam",
      age: 33,
    });

    form.setField("name", "Alex");
    form.reset();

    expect(form.model.name).toBe("Adam");
    expect(form.model.age).toBe(33);
  });

  it("clears model by types when clearValues are not provided", () => {
    const form = useModel({
      name: "Adam",
      age: 33,
      isAdmin: true,
      tags: ["vue"],
      address: {
        city: "London",
      },
    });

    form.clear();

    expect(form.model.name).toBe("");
    expect(form.model.age).toBe(0);
    expect(form.model.isAdmin).toBe(false);
    expect(form.model.tags).toEqual([]);
    expect(form.model.address.city).toBe("");
  });

  it("uses nested clearValues when provided", () => {
    const form = useModel(
      {
        name: "Adam",
        age: 33,
        address: {
          city: "London",
          zip: "3011",
        },
      },
      {
        clearValues: {
          age: null,
          address: {
            city: "London",
          },
        },
      }
    );

    form.clear();

    expect(form.model.name).toBe("");
    expect(form.model.age).toBeNull();
    expect(form.model.address.city).toBe("London");
    expect(form.model.address.zip).toBe("");
  });

  it("clears a specific field using clearValues", () => {
    const form = useModel(
      {
        address: {
          city: "London",
        },
      },
      {
        clearValues: {
          address: {
            city: "London",
          },
        },
      }
    );

    form.setField("address.city", "Berlin");
    form.clearField("address.city");

    expect(form.model.address.city).toBe("London");
  });

  it("resets a specific field to its initial value", () => {
    const form = useModel({
      address: {
        city: "London",
      },
    });

    form.setField("address.city", "Berlin");
    form.resetField("address.city");

    expect(form.model.address.city).toBe("London");
  });

  it("deep merges with patch", () => {
    const form = useModel({
      address: {
        city: "London",
        zip: "3011",
      },
      profile: {
        theme: "dark",
      },
    });

    form.patch({
      address: {
        city: "Amsterdam",
      },
    });

    expect(form.model.address.city).toBe("Amsterdam");
    expect(form.model.address.zip).toBe("3011");
    expect(form.model.profile.theme).toBe("dark");
  });

  it("tracks dirty state", () => {
    const form = useModel({
      name: "Adam",
    });

    expect(form.isDirty.value).toBe(false);

    form.setField("name", "Alex");

    expect(form.isDirty.value).toBe(true);
  });
});