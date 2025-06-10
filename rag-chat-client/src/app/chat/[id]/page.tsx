import { SessionServerSide } from "@/api/session.api";
import ChatSessionPage from "@/components/SesssionMessages";
import { SessionType } from "@/hooks/useSession";
import { redirect } from "next/navigation";

interface PageProps {
  params?: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[]>>;
}

async function getData(id: string | undefined | null) {
  try {
    if (id) {
      const sessionData = await SessionServerSide.sessionById(id);
      return sessionData as SessionType;
    }
    return null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default async function Chat({ params }: PageProps) {
  const props = await params;
  const data = await getData(props ? props.id : null);
  if (data) {
    return <ChatSessionPage sessionData={data} />;
  }
  redirect("/");
}
