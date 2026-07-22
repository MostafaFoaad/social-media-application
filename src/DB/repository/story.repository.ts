import type { IStory } from "../../common/interfaces/story.interface.js";
import { StoryModel } from "../model/story.model.js";
import { DatabaseRepository } from "./base.repository.js";

export class StoryRepository extends DatabaseRepository<IStory>{
    constructor(){
        super(StoryModel)
    }
}