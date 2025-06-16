"use client"
import React, { useState } from "react"
import { BiLike, BiDislike, BiSolidLike, BiSolidDislike } from "react-icons/bi"
import Image from "next/image"
import http from "@/config/http"
import bot from "@/assets/images/bot.png"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { motion } from "framer-motion"
import useAuth from "@/store/user" // Import useAuth hook
import usePublicChat from "@/store/public_chat"
import useNavBarStore from "@/store/store"
import { marked } from "marked"
import DOMPurify from "dompurify"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw" // Allows rendering inline HTML inside Markdown
import remarkGfm from "remark-gfm"
export const MessageDiv = ({ msg }: any) => {
  const { access_token, user_data } = useAuth() // Call useAuth here
  const { publicChat, publicChatHeaders } = usePublicChat()
  const { botName } = useNavBarStore()
  const [showFeedbackModal, setFeedbackModal] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState("")
  const [feedbackId, setFeedbackId] = useState(null)
  //get feedback fr  om msg.liked or msg.disliked and set accordingly\
  const [selectedFeedback, setSelectedFeedback] = useState<
    "liked" | "disliked" | null
  >(null)

  const [feedback, setFeedback] = useState(
    msg.liked ? "liked" : msg.disliked ? "disliked" : null
  )

  const submitFeedback = async () => {
    console.log("submit feedback", selectedFeedback)
    if (selectedFeedback == "liked") {
      setFeedback("liked")
      await sendFeedbackToBackend("liked", feedbackId)
    } else if (selectedFeedback == "disliked") {
      setFeedback("disliked")
      await sendFeedbackToBackend("disliked", feedbackId)
    }
    setFeedbackModal(false)
  }
  const closeModal = () => {
    setFeedbackModal(false)
    setFeedbackMsg("")
    setFeedback(null)
  }
  const openFeedbackModal = () => {
    console.log("feedback modal")
    setFeedbackModal(!showFeedbackModal)
  }
  const handleLike = async (id) => {
    setFeedbackId(id)
    console.log("liked id is ", id)
    setSelectedFeedback("liked")
    openFeedbackModal()
    // if (feedback === null) {
    //   setFeedback("liked")
    //   await sendFeedbackToBackend("liked", id)
    // }
  }
  const handleDislike = async (id) => {
    setFeedbackId(id)
    setSelectedFeedback("disliked")
    openFeedbackModal()
    console.log("disliked id is ", id)
    // if (feedback === null) {
    //   setFeedback("disliked")
    //   await sendFeedbackToBackend("disliked", id)
    // }
  }
  function convertToHTMLList(paragraph: any) {
    const regex = /(\d+\.\s)([^.]+\.\s?)/g // Regular expression to match numbered items and text until the next period
    let matches
    let updatedParagraph = paragraph?.replace(/\n/g, "") // Remove newline characters
    while ((matches = regex.exec(updatedParagraph)) !== null) {
      const listItem = `<li>${matches[1]}${matches[2]}</li>`
      updatedParagraph = updatedParagraph.replace(matches[0], listItem)
    }

    if (updatedParagraph?.includes("<li>")) {
      updatedParagraph = `<ul>${updatedParagraph}</ul>`
    }

    return updatedParagraph
  }

  // const cleanAndConvertMessage = (message: string) => {
  //   if (message) {
  //     // Remove HTML tags
  //     // const strippedMessage = message?.replace(/<\/?[^>]+(>|$)/g, "")

  //     // Convert Markdown to HTML
  //     const sanitizedMessage = message.replace(/\\`/g, "`")
  //     const htmlMessage = marked(sanitizedMessage)

  //     return htmlMessage
  //   } else {
  //     return ""
  //   }
  // }
  // const cleanAndConvertMessage = (message: string) => {
  //   if (message) {
  //     try {
  //       // Remove HTML tags if needed (optional)
  //       const strippedMessage = message.replace(/<\/?[^>]+(>|$)/g, "")

  //       // Detect and extract the Markdown from the code block
  //       const codeBlockRegex = /```markdown([\s\S]*?)```/
  //       const match = strippedMessage.match(codeBlockRegex)

  //       let contentToParse = strippedMessage
  //       if (match) {
  //         // Use only the content inside the code block
  //         contentToParse = match[1].trim()
  //       }

  //       // Convert Markdown to HTML
  //       const htmlMessage = marked(contentToParse)

  //       return htmlMessage
  //     } catch (error) {
  //       console.error("Error parsing Markdown:", error)
  //       return "Error parsing content."
  //     }
  //   } else {
  //     return ""
  //   }
  // }
  const cleanAndConvertMessage = (message: string) => {
    console.log("------")
    console.log("msg.message", msg.message)
    console.log("------")
    if (!message) return ""

    try {
      // Remove HTML tags if needed (optional)
      const strippedMessage = message.replace(/<\/?[^>]+(>|$)/g, "")

      // Convert Markdown to HTML
      const htmlMessage = marked(strippedMessage)

      // Sanitize the HTML content
      const sanitizedHtmlMessage = DOMPurify.sanitize(htmlMessage)

      return sanitizedHtmlMessage
    } catch (error) {
      console.error("Error parsing Markdown:", error)
      return "Error parsing content."
    }
  }
  const sendFeedbackToBackend = async (
    feedbackType: "liked" | "disliked",
    id: any
  ) => {
    try {
      //sent to our backend feedback
      const conversationId = id.split("ANS_")[1]

      let res
      if (publicChat) {
        res = await http.post(
          `/feedback/public/add?org_id=${publicChatHeaders?.org_id}&chat_session=${publicChatHeaders?.chat_session}`,
          {
            feedback: feedbackType,
            conversation: conversationId,
            org_id: publicChatHeaders?.org_id,
            user_id: publicChatHeaders?.user_id,
            feedbackMsg,
          }
        )
      } else {
        res = await http.post(
          "/feedback/add",
          {
            feedback: feedbackType,
            conversation: conversationId,
            feedbackMsg,
          },
          { headers: { Authorization: `Bearer ${access_token}` } }
        )
      }
      const feedbackId = res.data.newFeedback._id

      let res_
      if (publicChat) {
        res_ = await http.post(
          `/conversation/public/update_like_dislike?org_id=${publicChatHeaders?.org_id}&chat_session=${publicChatHeaders?.chat_session}`,
          {
            id: conversationId,
            liked_disliked: feedbackType,
          },
          {
            headers: {
              ...publicChatHeaders,
              Authorization: `Bearer ${access_token}`,
            },
          }
        )
      } else {
        //update in our converstaion backend
        res_ = await http.post(
          "conversation/update_like_dislike",
          { id: conversationId, liked_disliked: feedbackType },
          { headers: { Authorization: `Bearer ${access_token}` } }
        )
      }

      //send to our third api
      const result = await http.sendFeedback(
        feedbackId,
        user_data?.organization || publicChatHeaders?.org_id,
        feedbackType
      )
      toast.success("Successfully sent the feedback")
      return res
    } catch (error) {
      console.error("Error sending feedback:", error)
      toast.error("Failed to send feedback")
    }
  }

  return (
    <div className="content m-2 flex gap-1 text-sm">
      {msg.sender !== "user" ? (
        <div className="group relative w-full pb-6">
          <div className="timeandname  mb-2 flex items-center justify-start gap-2 text-[#838383] ">
            <Image
              src={bot}
              className="rounded-full"
              alt=""
              height={30}
              width={30}
            />
            <p dangerouslySetInnerHTML={{ __html: botName }} />
            <span>{msg.time}</span>
          </div>
          {/* <motion.div
            className="ml-4 max-w-[90%] space-y-4 rounded-md border-[#838383] bg-[#F7f7f7] p-5 pl-6 text-black shadow-[1px_1px_10px_rgba(0,0,0,0.2)]" // Add space or extra padding if needed
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            dangerouslySetInnerHTML={{
              __html: cleanAndConvertMessage(msg.message),
            }}
          ></motion.div> */}
          <motion.div
            className="ml-4 max-w-[90%] space-y-4 rounded-md border-[#838383] bg-[#F7f7f7] p-5 pl-6 text-black shadow-[1px_1px_10px_rgba(0,0,0,0.2)]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="prose prose-lg prose-gray max-w-none text-sm">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
              >
                {msg.message}
              </ReactMarkdown>
            </div>
          </motion.div>
          <div className="likebuttons absolute  left-2 py-1 pl-2">
            {msg.id !== "greeting" && msg.id !== "loading" && (
              <span className=" hidden gap-2 transition-all duration-100 group-hover:flex ">
                {feedback === null && (
                  <>
                    <div
                      className="likeholder cursor-pointer"
                      onClick={() => handleLike(msg.id)}
                    >
                      <BiLike size={20} />
                    </div>
                    <div
                      className="dislikeholder cursor-pointer"
                      onClick={() => handleDislike(msg.id)}
                    >
                      <BiDislike size={20} />
                    </div>
                  </>
                )}
                {feedback === "liked" && <BiSolidLike size={20} />}
                {feedback === "disliked" && <BiSolidDislike size={20} />}
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="w-full justify-end">
          <div className="timeandname mb-2 flex items-center justify-end gap-2 text-sm text-[#838383]">
            <span>{msg.sender}</span>
            <span>{msg.time}</span>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="float-right max-w-[90%] break-words rounded-md border-[#e7e7e7] bg-[#ffffff] p-3 text-black shadow-[1px_2px_10px_rgba(0,0,0,0.15)]"
          >
            <div className="prose prose-lg prose-gray max-w-none text-sm">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw]}
                remarkPlugins={[remarkGfm]}
              >
                {msg.message}
              </ReactMarkdown>
            </div>
          </motion.div>
        </div>
      )}

      {/* Feedback Modal */}
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-lg font-medium">
              {feedback === "liked"
                ? "What did you like?"
                : "What can we improve?"}
            </h2>
            <textarea
              className="mb-4 h-24 w-full rounded border p-2"
              placeholder="Add your comment..."
              value={feedbackMsg}
              onChange={(e) => setFeedbackMsg(e.target.value)}
            ></textarea>
            <div className="flex justify-end gap-2">
              <button
                className="rounded bg-gray-200 px-4 py-2 hover:bg-gray-300"
                onClick={closeModal}
              >
                Cancel
              </button>
              <button
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                onClick={submitFeedback}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
