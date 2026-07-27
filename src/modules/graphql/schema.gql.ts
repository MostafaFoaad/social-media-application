import { GraphQLObjectType, GraphQLSchema } from "graphql";
import { userGQLSchema } from "../user/index.js";
import { /* PostGQLSchema, */ postGQLSchema } from "../post/index.js";

const query=new GraphQLObjectType({
    name:"RootSchemaQuery",
    description:"QuerySchema",
    fields:{
        ...userGQLSchema.registerQuery(),
        ...postGQLSchema.registerQuery()
    }
});

const mutation=new GraphQLObjectType({
    name:"RootSchemaMutation",
    description:"MutationSchema",
    fields:{
        ...postGQLSchema.registerMutation()
    }
});

export const schema=new GraphQLSchema({query,mutation});