import type { ConfirmEmailOtpDto, LoginDto, ResendConfirmEmailDto, SignupDto } from "./auth.dto.js";
import type { IUser } from "../../common/interfaces/user.interface.js";
import { BadException, ConflictException, NotFoundException } from "../../common/exceptions/domain.exception.js";
import { UserRepository } from "../../DB/repository/user.repository.js";
import { compareHash, generateHash } from "../../common/utils/security/hash.security.js";
//import { generateEncryption } from "../../common/utils/security/encryption.security.js";
import { sendEmail } from "../../common/utils/email/send.email.js";
import { verifyEmailTemplate } from "../../common/utils/email/template.email.js";
import { redisService,  RedisService } from "../../common/services/redis.service.js";
import { EmailEnum } from "../../common/enums/email.enum.js";
import { emailEvent } from "../../common/utils/email/event.email.js";
import { createNumberOtp } from "../../common/utils/otp.js";
import { ProviderEnum } from "../../common/enums/user.enum.js";
import { TokenService } from "../../common/services/token.service.js";
import type { ILoginResponse } from "./auth.entity.js";
import { notificationService, type NotificationService } from "../../common/services/notification.service.js";
import { OAuth2Client, type TokenPayload } from "google-auth-library";
import { AUDIENCE } from "../../config/config.js";


class AuthenticationService{
    private userRepository:UserRepository;
    private readonly redis:RedisService;
    private readonly tokenService:TokenService;
    private readonly notification:NotificationService;
    constructor(){
        this.userRepository=new UserRepository();
        this.redis=redisService;
        this.tokenService=new TokenService();
        this.notification= notificationService
    }

    public async login(inputs:LoginDto,issuer:string):Promise<ILoginResponse>{
    const { email, password, FCM } = inputs;
    const user = await this.userRepository.findOne({
        filter: { email,provider:ProviderEnum.SYSTEM ,confirmEmail:{$exists:true} },
    });

    if (!user) {
        throw new NotFoundException('INVALID LOGIN CREDENTIALS');
    }

    if (!await compareHash({plaintext:password, ciphertext:user.password})) {
        throw new NotFoundException('INVALID LOGIN DATA');
    }

    if(FCM){
        await this.redis.addFCM(user._id,FCM);
        const tokens=await this.redis.getFCMs(user._id);
        if(tokens?.length){
            await this.notification.sendNotifications({tokens,data:{title:"login",body:"SUCCESSFULL LOGIN"}})
        }
    }


    return await this.tokenService.createLoginCredentials(user,issuer);
    }


    private async SendEmailOtp({email,subject,title}:{email:string,subject:EmailEnum,title:string}){
    
    const isBlockedTtl=await this.redis.ttl(this.redis.blockOtpKey({email,subject}));
    if(isBlockedTtl>0){
        
        throw new BadException(`SORRY WE CANNOT RESEND NEW OTP WHILE THE CURRENT ONE IS STILL BLOCKED PLEASE TRY AGAIN AFTER ${isBlockedTtl}`)
    }

    const remainingOtpTtl=await this.redis.ttl(this.redis.otpKey({email,subject}));

    if(remainingOtpTtl>0){
        throw new BadException(`SORRY WE CANNOT RESEND NEW OTP WHILE THE CURRENT ONE STILL VALID PLEASE TRY AGAIN AFTER ${remainingOtpTtl}`)
    }

    const maxTrial=await this.redis.get(this.redis.maxAttemptOtpKey({email,subject}));
    if(maxTrial>=3){
        await this.redis. set({
            key:this.redis.blockOtpKey({email,subject}),
            value:1,
            ttl:7*60
        })
        throw new BadException(`YOU HAVE REACHED THE MAX TRIAL`)
    }

    const code=createNumberOtp();

    await this.redis. set({
        key:this.redis.otpKey({email,subject}),
        value:await generateHash({plaintext:`${code}`}),
        ttl:120
    })
    emailEvent.emit("sendEmail",async()=>{
        await sendEmail({
        to:email,
        subject,
        html:verifyEmailTemplate({code,title})
    })

    await this.redis. incr(this.redis.maxAttemptOtpKey({email,subject}))
    })
    
    }

    public async confirmEmail({email,otp}:ConfirmEmailOtpDto){
    
    
    const hashOtp=await this.redis.get(this.redis.otpKey({email,subject:EmailEnum.Confirm_Email}));
    if (!hashOtp) {
        throw new NotFoundException('EXPIRED OTP');
    }
    
    const account = await this.userRepository. findOne({
        filter: { email ,confirmEmail:{$exists:false},provider:ProviderEnum.SYSTEM }
    });
    if (!account) {
        throw new NotFoundException('FAIL TO FIND MATCHING ACCOUNT');
    }
    if(!await compareHash({plaintext:otp,ciphertext:hashOtp})){
        throw new ConflictException('INVALID OTP');
    }

    account.confirmEmail=new Date();
    await account.save();

    await this.redis.deleteKey(await this.redis.keys(this.redis.otpKey({email})))
    return;
    };

    public async resendConfirmEmail ({email}:ResendConfirmEmailDto) {
    const account = await this.userRepository. findOne({
        filter: { email ,confirmEmail:{$exists:false},provider:ProviderEnum.SYSTEM }
    });
    if (!account) {
        throw new NotFoundException('FAIL TO FIND MATCHING ACCOUNT');
    }


    await this.SendEmailOtp({email,subject:EmailEnum.Confirm_Email,title:"Verify-Email"});

    return;
    };

     public async signup({email,username,password,phone}:SignupDto):Promise<IUser>{
        const checkUserExist=await this.userRepository.findOne({
            filter:{email},
            projection:"email",
            options:{lean:true}

        })
        if(checkUserExist){
            throw new ConflictException("EMAIL EXISTS");
        }
        const user=await this.userRepository.createOne({
            data:{email,username,phone:phone as string,password}
        })
        if(!user){
            throw new BadException("fail");
        }
        this.SendEmailOtp({email,subject:EmailEnum.Confirm_Email,title:"VERIFY_EMAIL"})
        return user.toJSON();
    } 

     private async verifyGoogleAccount(idToken:string):Promise<TokenPayload>{
        const client = new OAuth2Client();
        const ticket = await client.verifyIdToken({
            idToken,
            audience: AUDIENCE,  
                });
        const payload = ticket.getPayload();
        if(!payload?.email_verified){
            throw new BadException('Fail to verify by google');
                }
        return payload;
    }

     async loginWithGmail(idToken:string,issuer:string){
        const payLoad= await this.verifyGoogleAccount(idToken);
        console.log(payLoad);
        const user=await this.userRepository. findOne({
            filter:{email:payLoad.email as string , provider:ProviderEnum.GOOGLE}
     })
     if(!user){
        throw new NotFoundException('NOT REGISTERED ACCOUNT');
        
     }
     return await this.tokenService.createLoginCredentials(user,issuer);
    }

     async signupWithGmail(idToken:string,issuer:string){
        const payLoad= await this.verifyGoogleAccount(idToken);
        console.log(payLoad);
        const checkExist=await this.userRepository.findOne({
            filter:{email:payLoad.email as string}
        })
     if(checkExist){
        if(checkExist.provider!==ProviderEnum.GOOGLE){
            throw new ConflictException('Invalid login provider');
        }
        return {status:200,Credentials:await this.loginWithGmail(idToken,issuer)};;
     }

        const user=await this.userRepository.createOne({
        data:{
            firstName:payLoad.given_name as string,
            lastName:payLoad.family_name as string,
            email:payLoad.email as string,
            profilePicture:payLoad.picture as string,
            confirmEmail:new Date(),
            provider:ProviderEnum.GOOGLE
        }
     })
    return {status:201,Credentials:await this.tokenService.createLoginCredentials(user,issuer)};
    } 

    
}

export default new AuthenticationService();