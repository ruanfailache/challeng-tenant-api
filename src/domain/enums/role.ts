export const Role = {
    ADMIN: 'ADMIN',
    MEMBER: 'MEMBER',
    OWNER: 'OWNER',
} as const;

export type Role = (typeof Role)[keyof typeof Role];