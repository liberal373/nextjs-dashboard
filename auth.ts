import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { z } from 'zod'
import type { User } from '@/app/lib/definitions'
import bcrypt from 'bcrypt'
import postgres from 'postgres'
import type { NextAuthConfig } from 'next-auth'

const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`
    return user[0]
  } catch (error) {
    console.error('Failed to fetch user:', error)
    throw new Error('Failed to fetch user.')
  }
}

// ✅ 创建 NextAuth 配置对象（不是调用 NextAuth()）
const config = {
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials)

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          const user = await getUser(email)
          if (!user) return null
          const passwordsMatch = await bcrypt.compare(password, user.password)
          if (passwordsMatch) return user
        }

        console.log('Invalid credentials')
        return null
      },
    }),
  ],
} satisfies NextAuthConfig

// ✅ 使用 NextAuth() 生成 handlers（用于 route.ts）和 auth（用于中间件）
export const { handlers, auth, signIn, signOut } = NextAuth(config)
