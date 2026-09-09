import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session:{strategy:"jwt"},
  providers:[Credentials({
    credentials:{email:{},password:{}},
    async authorize(c){
      const parsed=z.object({email:z.string().email(),password:z.string().min(6)}).safeParse(c);
      if(!parsed.success) return null;
      const user=await db.user.findUnique({where:{email:parsed.data.email}});
      if(!user || !(await bcrypt.compare(parsed.data.password,user.passwordHash))) return null;
      return {id:user.id,name:user.name,email:user.email,role:user.role,language:user.language};
    }
  })],
  callbacks:{
    async jwt({token,user}){ if(user){token.id=user.id;token.role=(user as any).role;token.language=(user as any).language} return token },
    async session({session,token}){ if(session.user){(session.user as any).id=token.id;(session.user as any).role=token.role;(session.user as any).language=token.language} return session }
  },
  pages:{signIn:"/login"}
});