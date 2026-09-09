import "next-auth";
declare module "next-auth" {
  interface Session { user:{id:string;role:string;language:string}&DefaultSession["user"] }
}