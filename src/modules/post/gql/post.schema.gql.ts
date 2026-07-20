import {postListResolver, PostListResolver } from './post.resolver.js';
import * as PostListTypes from './post.types.gql.js';
import * as PostListArgs from './post.args.gql.js';
export class PostGQLSchema{
    private postListResolver:PostListResolver
    constructor(){
        this.postListResolver=postListResolver;
    }

    registerQuery(){
        return{
            postList:{
                type:PostListTypes.postList,
                args:PostListArgs.postList,
                resolve:this.postListResolver.postList,
            }
        }
    }

    registerMutation(){
            return{
                reactPost:{
                    type:PostListTypes.reactOnPost,
                    args:PostListArgs.reactionsOnPost,
                    describtion:"REACT TEXT",
                    resolve:this.postListResolver.reactionsOnPost
                }
            }
        }
}

export const postGQLSchema=new PostGQLSchema();