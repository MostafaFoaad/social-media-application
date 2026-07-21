import {z} from 'zod';
import { generalValidationFields } from '../../common/validation/general.validation.js';
export const likeMessage={
    params:z.strictObject({
        messageId:generalValidationFields.id,
        chatId:generalValidationFields.id
    }),
}