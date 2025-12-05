import Page from "./(public)/login/page";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import authOptions from "@/libs/auth-options";

export default async function Home() {
    return <Page />;
}
