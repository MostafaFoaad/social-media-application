import { GraphQLString } from "graphql";
import * as GraphQLTypes from './user.types.gql.js';
import * as GraphQLArgs from './user.args.gql.js';
import {userResolver,  UserResolver } from "./user.resolver.js";
export class UserGQLSchema{
    private userResolver:UserResolver
    constructor(){
        this.userResolver=userResolver
    }

    registerQuery(){
        return {
            profile:{
                type:GraphQLTypes.profile,
                args:GraphQLArgs.profile,
                describtion:"WELCOME TEXT",
                resolve:this.userResolver.profile
            }
        }
    }

    registerMutation(){
        return{
            like:{
                type:GraphQLTypes.profile,
                describtion:"LIKE TEXT",
                resolve:()=>{
                    return {message:"HELLO LIKE"}
                }
            }
        }
    }
}

export const userGQLSchema=new UserGQLSchema();