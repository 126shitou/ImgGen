// lib/auth/auth-options.ts
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import { connectToDatabase } from "./mongoose"; // 假设您已有此函数用于 Mongoose 连接
import User from '@/models/User'
import { getCurrentTime } from '@/lib/utils'
export const authOptions: AuthOptions = {
    // 配置身份验证提供商
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            httpOptions: {
                timeout: 30000
            }
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,
            httpOptions: {
                timeout: 30000
            }
        }),
    ],
    session: {
        strategy: "jwt", // 使用 JWT 策略
        maxAge: 6 * 24 * 60 * 60, // 30 天
    },
    callbacks: {
        async signIn({ user, account, profile }) {
            await connectToDatabase()

            const dbUser = await User.findOne({ email: user.email });
            if (!dbUser) {
                console.log("InsertUser nox exist!");

                const InsertUser = new User({
                    thirdPartId: user.id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    balance: 0,
                    createDate: getCurrentTime()
                });
                await InsertUser.save()
                console.log("InsertUser insert success!");
                return InsertUser
            }

            return true
        },
        async jwt({ token, user, account }) {

            if (user) {
                token.id = user.id;
            }
            return token;
        },

        async session({ session, token }) {
            const sessionUser = await User.findOne({ email: session.user.email });
            session.user.id = sessionUser._id.toString();

            session.user = { ...session.user, ...sessionUser._doc }
            return session
        },

        // // 可选：自定义重定向回调
        // async redirect({ url, baseUrl }) {
        //     // 允许内部相对 URL
        //     if (url.startsWith("/")) return `${baseUrl}${url}`;
        //     // 允许回到同一站点的 URL
        //     else if (new URL(url).origin === baseUrl) return url;
        //     return baseUrl;
        // }
    },

    // 自定义页面
    pages: {
        signIn: "/auth/login", // 自定义登录页面
        error: "/auth/error", // 错误页面
    },

    // 开发环境下启用调试模式
    debug: process.env.NODE_ENV === "development",
    secret: process.env.NEXTAUTH_SECRET
};