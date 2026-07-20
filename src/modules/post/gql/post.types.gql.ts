import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLObjectType, GraphQLString } from "graphql";
import { OneUserType } from "../../user/gql/user.types.gql.js";
import { AvailabilityEnum } from "../../../common/enums/post.enum.js";
import { ReactTypeEnum } from "../../../common/enums/react.enum.js";
import { ReactionsOnPostGQLEnumType } from "./post.args.gql.js";

export const AvailabilityEnumGQLType=new GraphQLEnumType({
    name:"AvailabilityEnumGQLType",
    values:{
        Public:{value:AvailabilityEnum.PUBLIC},
        Friends:{value:AvailabilityEnum.FRIENDS},
        Only_Me:{value:AvailabilityEnum.ONLY_ME}
    }
})

export const ReactionsOnPostType=new GraphQLObjectType({
    name:"OneReactionType",
    fields:{
        userId:{type:new GraphQLNonNull(GraphQLID)},
        react:{type:ReactionsOnPostGQLEnumType},
        _id:{type:new GraphQLNonNull(GraphQLID)},
    }
})
export const OnePostType=new GraphQLObjectType({
    name:"OnePostType",
    fields:{
                        _id:{type:new GraphQLNonNull(GraphQLID)},
                        folderId:{type:new GraphQLNonNull(GraphQLString)},
                        content:{type:GraphQLString},
                        attachments:{type:new GraphQLList(GraphQLString)},
                        likes:{type:new GraphQLList(OneUserType)},
                        reactions:{type:new GraphQLList(ReactionsOnPostType)},
                        tags:{type:new GraphQLList(OneUserType)},
                        createdBy:{type:new GraphQLList(OneUserType)},
                        updatedBy:{type:OneUserType},
                        createdAt:{type:new GraphQLNonNull(GraphQLString)},
                        deletedAt:{type:GraphQLString},
                        restoredAt:{type:GraphQLString},
                        updatedAt:{type:GraphQLString},
                        availability:{type:AvailabilityEnumGQLType}
    }
})

export const postList=new GraphQLObjectType({
    name:"PostListResponse",
    fields:{
        message:{type:new GraphQLNonNull(GraphQLString)},
        data:{
            type:new GraphQLObjectType({
                name:"PostPaginationRespone",
                fields:{
                    docs:{type:new GraphQLList(OnePostType)},
                    currentPage:{type:GraphQLInt},
                    pages:{type:GraphQLInt},
                    size:{type:GraphQLInt},
                } 
            })
        }
    }
})


export const reactOnPost=new GraphQLObjectType({
    name:"ReactOnPostResponse",
    fields:{
        message:{type:new GraphQLNonNull(GraphQLString)},
        data:{type:OnePostType}
    }
})

