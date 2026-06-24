import type { IComment } from "../../common/interfaces/index.js";
import { CommentModel } from "../model/comment.model.js";
import { DatabaseRepository } from "./base.repository.js";

export class CommentRepository extends DatabaseRepository<IComment>{
    constructor(){
        super(CommentModel)
    }
}