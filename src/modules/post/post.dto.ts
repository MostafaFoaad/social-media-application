import  {z} from "zod";
import { reactionsOnPost, reactionsOnPostGQL, type createPost, type reactPost, type reactPostGQL, type updatePost } from "./post.validation.js";

export type createPostBodyDto=z.infer<typeof createPost.body>;
export type ReactPostQueryDto=z.infer<typeof reactPost.query>;
export type ReactPostParamsDto=z.infer<typeof reactPost.params>;
export type ReactionsOnPostParamsDto=z.infer<typeof reactionsOnPost.params>;
export type ReactionsOnPostQueryDto=z.infer<typeof reactionsOnPost.query>;
export type UpdatePostBodyDto=z.infer<typeof updatePost.body>;
export type UpdatePostParamsDto=z.infer<typeof updatePost.params>;
export type ReactOnPostGQLDto=z.infer<typeof reactPostGQL>;
export type ReactionsOnPostGQLDto=z.infer<typeof reactionsOnPostGQL>;