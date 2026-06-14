import type { IPost } from "../../common/interfaces/post.interface.js";
import { PostModel } from "../model/post.model.js";
import { DatabaseRepository } from "./base.repository.js";

export class PostRepository extends DatabaseRepository<IPost>{
    constructor(){
        super(PostModel)
    }
}