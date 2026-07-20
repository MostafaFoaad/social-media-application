import {z} from "zod";
import type { profilePosts } from "./user.validation.js";
export type profilePostsParamsDto=z.infer<typeof profilePosts.params>;