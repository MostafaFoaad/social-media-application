import {z} from 'zod';
import type { likeMessage } from './chat.validation.js';

export type LikeMessageParamsDto=z.infer<typeof likeMessage.params>;