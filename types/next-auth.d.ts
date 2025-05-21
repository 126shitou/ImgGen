import NextAuth from "next-auth"
declare module "next-auth" {
    interface Session {
        user: {
            id?: string
            name?: string
            email?: string
            balance: number
            image?: string | null
            thirdPartId: string | null
            createDate?: string | null
            updateDate: string | null
        }
    }
    interface User {
        id?: string
        name?: string
        email?: string
        balance: number
        image?: string | null
        thirdPartId: string | null
        createDate?: string | null
        updateDate: string | null
    }
}
declare module "next-auth/jwt" {
    interface JWT {
        id?: string
        provider?: string
        picture?: string | null
    }
}
