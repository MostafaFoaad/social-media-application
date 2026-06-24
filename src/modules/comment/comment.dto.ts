import  {z} from "zod";
import type { createComment, replyOnComment } from "./comment.validation.js";

export type CreateCommentBodyDto=z.infer<typeof createComment.body>;
export type CreateCommentParamsDto=z.infer<typeof createComment.params>;
export type ReplyOnCommentBodyDto=z.infer<typeof replyOnComment.body>;
export type ReplyOnCommentParamsDto=z.infer<typeof replyOnComment.params>;