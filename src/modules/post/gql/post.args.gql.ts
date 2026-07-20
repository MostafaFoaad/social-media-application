import { GraphQLEnumType, GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { ReactTypeEnum } from "../../../common/enums/react.enum.js";

export const ReactGQLEnumType=new GraphQLEnumType({
    name:"ReactEnum",
    values:{
        Dislike:{value:0},
        Like:{value:1}
    }
})

export const ReactionsOnPostGQLEnumType=new GraphQLEnumType({
    name:"ReactionsOnPostEnum",
    values:{
    LIKE:{value:ReactTypeEnum.LIKE},
    LOVE:{value:ReactTypeEnum.LOVE},
    CARE:{value:ReactTypeEnum.CARE},
    ANGRY:{value:ReactTypeEnum.ANGRY},
    HAHA:{value:ReactTypeEnum.HAHA},
    SAD:{value:ReactTypeEnum.SAD}
    }
})

export const postList={
    page:{type:GraphQLInt},
    size:{type:GraphQLInt},
    search:{type:GraphQLString}
}


export const reactOnPost={
    postId:{type:new GraphQLNonNull(GraphQLID)},
    react:{type:ReactGQLEnumType}
}

export const reactionsOnPost={
    postId:{type:new GraphQLNonNull(GraphQLID)},
    react:{type:ReactionsOnPostGQLEnumType}
}