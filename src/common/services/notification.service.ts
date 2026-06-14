import admin from "firebase-admin";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export class NotificationService{
    private client:admin.app.App
    constructor(){
        var serviceAccount = JSON.parse(readFileSync(resolve('./src/config/c45-second-app-firebase-adminsdk-fbsvc-24114559de.json'))as unknown as string)

this.client=admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
    }

    async sendNotification ({
    token,
    data 
}: {
    token: string,
    data: {title:string , body:string},
})  {
    const message = {
        token,
        // notification: {
        //     title,
        //     body,
        // },
        data,
    };

    return await this.client.messaging().send(message);
}


async sendNotifications ({
    tokens,
    data 
}: {
    tokens: string[],
    data: {title:string , body:string},
})  {

    Promise.allSettled(
        tokens.map(token=>{return this.sendNotification({token,data})})
    )
}


}

export const notificationService=new NotificationService();
