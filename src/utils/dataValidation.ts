// src/utils/dataValidation.ts

/**
 * Validates options to ensure they are arrays of objects with value and label as strings.
 * @param options - The array to be validated.
 * @returns A filtered and validated array of options.
 */
export const validateOptions = (options: any[]): { value: string; label: string }[] => {
    return Array.isArray(options)
      ? options
          .filter(
            (item) =>
              item &&
              typeof item === "object" &&
              "value" in item &&
              "label" in item &&
              typeof item.value === "string" &&
              typeof item.label === "string"
          )
          .map((item) => ({
            value: item.value,
            label: item.label,
          }))
      : [];
  };