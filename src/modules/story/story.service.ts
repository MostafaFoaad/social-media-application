import type { HydratedDocument } from "mongoose";
import  {s3Service, S3Service } from "../../common/services/s3.service.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import type { IUser } from "../../common/interfaces/user.interface.js";
import type { CreateStoryDto } from "./story.dto.js";
import  { StoryRepository } from "../../DB/repository/story.repository.js";
import { BadException, NotFoundException } from "../../common/exceptions/domain.exception.js";

export class StoryService{
        private userRepository:UserRepository
        private storyRepository:StoryRepository
        private s3Service:S3Service
        constructor(){
            this.userRepository=new UserRepository();
            this.storyRepository=new StoryRepository();
            this.s3Service=s3Service
        }

        async createStory(user:HydratedDocument<IUser>,{text,file,excludedUsers,backgroundColor}:CreateStoryDto){
            let attachmentUrl:string | undefined;

            if(file){
                attachmentUrl=await this.s3Service.uploadAsset({
                    file:file as Express.Multer.File,
                    path:`story/${user._id}`
                })
            }

            if(excludedUsers?.length){
                if(excludedUsers.some(id=>id.toString()===user._id.toString())){
                    throw new BadException("you cannot exclude yourself")
                }
                const users=await this.userRepository.find({
                    filter:{
                        _id:{$in:excludedUsers}
                    }
                })

                const existingUsersIds=users.map(user=>user._id.toString());

                const notExistingUsersIds=excludedUsers.filter(id=>!existingUsersIds.includes(id.toString()))

                if(notExistingUsersIds.length){
                    throw new NotFoundException(`User with id ${notExistingUsersIds.join(", ")} not found`)
                }

                
                    const friendsIds=(user.friends??[]).map(friend=>friend.toString())
                    const notFriend=excludedUsers.some(id=>!friendsIds.includes(id.toString()))
                    if(notFriend){
                        throw new BadException("You can exclude your friends")
                    }
                

            }

            const story=await this.storyRepository.createOne({
                data:{
                    owner:user._id,
                    text,
                    backgroundColor,
                    attachmentUrl,
                    excludedUsers,
                    
                }
            })

            return story;
        }
}

export const storyService=new StoryService()