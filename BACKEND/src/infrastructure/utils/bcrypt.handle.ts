import { hash, compare } from 'bcryptjs';

const encrypt = async (password: string) => {
    const passwordHash = await hash(password, 8);
    return passwordHash;
}

const verified = async (password: string, passwordHash: string) => {
    const passwordVerified = await compare(password, passwordHash);
    return passwordVerified;
}

export { encrypt, verified };