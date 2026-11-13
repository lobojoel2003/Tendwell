import { createHash, randomBytes } from 'node:crypto';

/** A short random id for database rows, safe to use in URLs. */
export const newId = () => randomBytes(12).toString('base64url');

/** A long random secret for cookies and invite links. */
export const newToken = () => randomBytes(32).toString('base64url');

/** Tokens are stored hashed, so a leaked database can't be used to sign in. */
export const hashToken = (token: string) => createHash('sha256').update(token).digest('base64url');
