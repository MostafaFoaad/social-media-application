import type { IUser } from "../../common/interfaces/user.interface.js";
import { UserModel } from "../model/user.model.js";
import { DatabaseRepository } from "./base.repository.js";

export class UserRepository extends DatabaseRepository<IUser>{
    constructor(){
        super(UserModel)
    }
}