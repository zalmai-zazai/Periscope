// src/types/mongoose.d.ts
import mongoose from "mongoose";

/**
 * Lean<T> — a simple helper type for results from .lean()
 * It strips mongoose.Document keys and ensures _id is a string.
 */
export type Lean<T> = Omit<T, keyof mongoose.Document> & { _id: string };
