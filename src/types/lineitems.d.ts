// src/types/mongoose.d.ts
import mongoose from "mongoose";

/**
 * Lean<T> — helper for results from .lean()
 * Strips mongoose.Document keys and ensures _id is a string.
 */
export type Lean<T> = Omit<T, keyof mongoose.Document> & { _id: string };
