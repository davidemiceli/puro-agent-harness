import { z } from 'zod';


export const validateName = name => z
    .string()
    .regex(/^[A-Za-z0-9-_]+$/)
    .parse(name);