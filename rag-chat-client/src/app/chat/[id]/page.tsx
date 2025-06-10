import { SessionServerSide } from "@/api/session.api";
import ChatSessionPage from "@/components/SesssionMessages";
import { SessionType } from "@/hooks/useSession";
import { redirect } from "next/navigation";

async function getData(id: string) {
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

export default async function Chat({ params }: { params: { id: string } }) {
  const data = await getData(params.id);
  if (data) {
    return <ChatSessionPage sessionData={data} />;
  }
  redirect("/");
}
