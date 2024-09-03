import React, { useEffect, useState } from "react";
import ChatInput from "./ChatInput";
import ChatList from "./ChatList";
import http from "@/config/http";
import useAuth from "@/store/user";
import useNavBarStore from "@/store/store";
import usePublicChat from "@/store/public_chat";
export interface MessageObject {
  id: string;
  sender: string;
  message: string;
  liked: boolean;
  time: string;
  disliked: boolean;
}

const ChatMain: React.FC = () => {
  const [messages, setMessages] = useState<MessageObject[]>([]);
  const { user_data, access_token, chatSession } = useAuth();
  const { greeting, botName, setBotName, setGreeting } = useNavBarStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { publicChat, publicChatHeaders, setPublicChatHeaders } = usePublicChat();

  useEffect(() => {
    const fetchBotNameAndMessages = async () => {
      setIsLoading(true);
      try {
        if (greeting === "Hello X" || botName === "Bot X") { // only fetch if it hasn't fetched, by default the zustand store will have Hello X
          await fetchBotData();
        }

        await getUserMessages();
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Error fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBotNameAndMessages();
  }, [user_data, access_token, chatSession, publicChat, publicChatHeaders]);

  const fetchBotData = async () => {
    let org_id;
    if (publicChat) {
      org_id = publicChatHeaders?.org_id;
    }
    else {
      org_id = user_data?.organization
    }
    const response = await http.get("/organization/greeting_botname?org_id=" + org_id);
    const org_data = response?.data;
    console.log("we are setting organization here", org_data)
    setBotName(org_data?.assistant_name);
    setGreeting(org_data?.greeting);
  };

  const getUserMessages = async () => {
    let res;
    try {
      if (publicChat) {
        res = await http.get(`/conversations/public?org_id=${publicChatHeaders?.org_id}`, {
          headers: publicChatHeaders,
        });
      }
      else {
        res = await http.get(`/conversations?user_id=${user_data?.user_id}&chatSession=${chatSession}`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
      }
      const messageArray = res?.data || [];
      setMessages([]);
      messageArray?.forEach((message: any) => {
        appendMessage({
          id: message._id,
          sender: "user",
          message: message.question,
          time: formatDate(message.createdAt.toString()),
          liked: false,
          disliked: false,
        });
        appendMessage({
          id: `ANS_${message._id}`,
          sender: botName,
          message: message.answer,
          time: formatDate(message.createdAt.toString()),
          liked: message.liked_disliked === "liked",
          disliked: message.liked_disliked === "disliked",
        });
      });
    } catch (error) {
      console.error("Error fetching user messages:", error);
      setError("Error fetching user messages");
    }

  };

  const appendMessage = (message: MessageObject) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  };

  return (
    <div className={`mx-1 flex    flex-col px-1 ${publicChat ? "md:h-[87vh] h-[90vh]" : "md:h-[77vh] h-[75vh]"} `}>
      {error && <div className="bg-red-500 text-white p-2 mb-2">{error}</div>}

      {isLoading && (
        <div className="bg-gray-200 text-gray-700 p-2 mb-2">Loading...</div>
      )}
      <ChatList messages={messages} />
      <ChatInput appendMessage={appendMessage} />
    </div>
  );
};

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  const options = {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  };
  return new Intl.DateTimeFormat("en-US", options).format(date);
}

export default ChatMain;