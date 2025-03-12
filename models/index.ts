import { Schema } from "mongoose";

export const generateLocaleSchema = (
  name?: string,
  options?: Record<string, any>
) => {
  return new Schema({
    en: {
      type: String,
      required: [
        true,
        name
          ? `Please provide the ${name} field (in English)`
          : "That field is required",
      ],
      ...options,
    },
    ar: {
      type: String,
      required: [
        true,
        name
          ? `Please provide the ${name} field (in Arabic)`
          : "That field is required",
      ],
      ...options,
    },
  });
};

export interface ILocaleContent {
  en: string;
  ar: string;
}
