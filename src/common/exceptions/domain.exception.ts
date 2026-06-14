import { ApplicationException } from "./application.exception.js";

export class ConflictException extends ApplicationException{
    constructor(message:string="Conflict",cause?:unknown){
        super(message,409,cause)
    }
}

export class BadException extends ApplicationException{
    constructor(message:string="Bad",cause?:unknown){
        super(message,400,cause)
    }
}

export class NotFoundException extends ApplicationException{
    constructor(message:string="NotFound",cause?:unknown){
        super(message,404,cause)
    }
}

export class UnauthorizedException extends ApplicationException{
    constructor(message:string="Unauthorized",cause?:unknown){
        super(message,401,cause)
    }
}


export class ForbiddenException extends ApplicationException{
    constructor(message:string="Forbidden",cause?:unknown){
        super(message,403,cause)
    }
}