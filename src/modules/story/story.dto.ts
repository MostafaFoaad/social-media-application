import {z} from "zod";
import type { createStory } from "./story.validation.js";

export type CreateStoryDto=z.infer<typeof createStory.body>;