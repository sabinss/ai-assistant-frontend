"use client"
import React, { useState } from "react"
import { BiLike, BiDislike, BiSolidLike, BiSolidDislike } from "react-icons/bi"
import http from "@/config/http"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { motion } from "framer-motion"
import useAuth from "@/store/user" // Import useAuth hook
import usePublicChat from "@/store/public_chat"
import { marked } from "marked"
import DOMPurify from "dompurify"
import ReactMarkdown from "react-markdown"
import rehypeRaw from "rehype-raw" // Allows rendering inline HTML inside Markdown
import remarkGfm from "remark-gfm"

function stripAnsPrefix(id: unknown): string {
  const s = id == null ? "" : String(id)
  return s.replace(/^ANS_/, "")
}

export const MessageDiv = ({ msg }: any) => {
  const { access_token, user_data } = useAuth() // Call useAuth here
  const { publicChat, publicChatHeaders } = usePublicChat()
  const [showFeedbackModal, setFeedbackModal] = useState(false)
  const [feedbackMsg, setFeedbackMsg] = useState("")
  const [feedbackId, setFeedbackId] = useState(null)
  //get feedback fr  om msg.liked or msg.disliked and set accordingly\
  const [selectedFeedback, setSelectedFeedback] = useState<"liked" | "disliked" | null>(null)
  const [feedbackLoading, setFeedbackLoading] = useState(false)

  const [feedback, setFeedback] = useState(msg.liked ? "liked" : msg.disliked ? "disliked" : null)
  const submitFeedback = async () => {
    setFeedbackLoading(true)
    console.log("Submit Feedback", selectedFeedback)
    if (selectedFeedback == "liked") {
      setFeedback("liked")
      await sendFeedbackToBackend("liked", feedbackId)
    } else if (selectedFeedback == "disliked") {
      setFeedback("disliked")
      await sendFeedbackToBackend("disliked", feedbackId)
    }
    setFeedbackLoading(false)
    setFeedbackModal(false)
  }
  const closeModal = () => {
    setFeedbackModal(false)
    setFeedbackMsg("")
    setFeedback(null)
  }
  const openFeedbackModal = () => {
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
    if (paragraph == null || typeof paragraph !== "string") return ""
    const regex = /(\d+\.\s)([^.]+\.\s?)/g // Regular expression to match numbered items and text until the next period
    let matches
    let updatedParagraph = paragraph.replace(/\n/g, "") // Remove newline characters
    while ((matches = regex.exec(updatedParagraph)) !== null) {
      const listItem = `<li>${matches[1]}${matches[2]}</li>`
      updatedParagraph = updatedParagraph.replace(matches[0], listItem)
    }

    if (updatedParagraph?.includes("<li>")) {
      updatedParagraph = `<ul>${updatedParagraph}</ul>`
    }

    return updatedParagraph
  }

  const cleanAndConvertMessage = (message: string) => {
    if (!message) return ""

    try {
      // Remove HTML tags if needed (optional)
      const strippedMessage = message.replace(/<\/?[^>]+(>|$)/g, "")

      // Sync parse (marked.parse may be typed as possibly async)
      const htmlMessage = marked.parser(marked.lexer(strippedMessage))

      // Sanitize the HTML content
      const sanitizedHtmlMessage = DOMPurify.sanitize(htmlMessage)

      return sanitizedHtmlMessage
    } catch (error) {
      console.error("Error parsing Markdown:", error)
      return "Error parsing content."
    }
  }
  const extractConversationId = (id: string) => {
    if (id == null || typeof id !== "string") return ""
    if (id.startsWith("ANS_")) {
      return id.split("ANS_")[1]
    } else if (id.startsWith("stream_")) {
      return id.split("stream_")[1]
    }
    return id // fallback if no prefix
  }
  const sendFeedbackToBackend = async (feedbackType: "liked" | "disliked", id: any) => {
    try {
      //sent to our backend feedback
      const conversationId = extractConversationId(id)

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
      // const result = await http.sendFeedback(
      //   feedbackId,
      //   user_data?.organization || publicChatHeaders?.org_id,
      //   feedbackType
      // )
      toast.success("Successfully sent the feedback")
      return res
    } catch (error) {
      console.error("Error sending feedback:", error)
      toast.error("Failed to send feedback")
    }
  }

  return (
    <div className="w-full text-sm">
      {msg.sender !== "user" ? (
        <div className="group relative w-full pb-4">
          <div className="flex flex-col items-start gap-1">
            <motion.div
              className="max-w-[90%] break-words rounded-[10px] border border-[#E2E6EF] bg-white px-3 py-[9px] text-[13px] leading-[1.55] text-[#1A1F2E]"
              style={{
                wordBreak: "break-word",
                overflowWrap: "break-word",
                borderBottomLeftRadius: 3,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
            <div
              className="markdown-content prose prose-sm prose-neutral max-w-none break-words text-[13px] leading-[1.55] text-[#1A1F2E] [&_*]:break-words [&_code]:break-all [&_li]:break-words [&_p]:break-words [&_pre]:break-words [&_pre_code]:break-all"
              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
            >
              <div className="overflow-x-auto">
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ node, children, ...props }) => (
                      <div className="my-4 w-full overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300" {...props}>
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
                    tbody: ({ node, ...props }) => <tbody {...props} />,
                    tr: ({ node, ...props }) => (
                      <tr className="border-b border-gray-300 hover:bg-gray-50" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold"
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border border-gray-300 px-4 py-2 text-left" {...props} />
                    ),
                  }}
                >
                  {msg.message ?? ""}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
            {msg.time ? (
              <div className="px-1 text-[10px] text-[#8B91A3]">{msg.time}</div>
            ) : null}
          <div className="likebuttons flex gap-2 py-1 pl-1">
            {msg.id !== "greeting" &&
              msg.id !== "agent_greeting" &&
              msg.id !== "loading" &&
              (msg.id?.startsWith("ANS_") || msg.conversationId?.startsWith("ANS_")) && (
                <span className="hidden gap-2 transition-all duration-100 group-hover:flex">
                  {feedback === null && (
                    <>
                      <div
                        className="likeholder cursor-pointer"
                        onClick={() =>
                          handleLike(
                            msg.conversationId != null && msg.conversationId !== ""
                              ? stripAnsPrefix(msg.conversationId)
                              : msg.id?.startsWith("ANS_")
                                ? stripAnsPrefix(msg.id)
                                : String(msg.id ?? "")
                          )
                        }
                      >
                        <BiLike size={20} />
                      </div>
                      <div
                        className="dislikeholder cursor-pointer"
                        onClick={() =>
                          handleDislike(
                            msg.conversationId != null && msg.conversationId !== ""
                              ? stripAnsPrefix(msg.conversationId)
                              : msg.id?.startsWith("ANS_")
                                ? stripAnsPrefix(msg.id)
                                : String(msg.id ?? "")
                          )
                        }
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
        </div>
      ) : (
        <div className="flex w-full flex-col items-end gap-1 pb-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="max-w-[90%] break-words rounded-[10px] bg-[#1B3A8C] px-3 py-[9px] text-[13px] leading-[1.55] text-white shadow-none"
            style={{
              wordBreak: "break-word",
              overflowWrap: "break-word",
              borderBottomRightRadius: 3,
            }}
          >
            <div
              className="markdown-content prose prose-sm prose-invert max-w-none break-words text-[13px] leading-[1.55] [&_*]:break-words [&_code]:break-all [&_li]:break-words [&_p]:break-words [&_pre]:break-words [&_pre_code]:break-all"
              style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
            >
              <div className="overflow-x-auto">
                <ReactMarkdown
                  rehypePlugins={[rehypeRaw]}
                  remarkPlugins={[remarkGfm]}
                  components={{
                    table: ({ node, children, ...props }) => (
                      <div className="my-4 w-full overflow-x-auto">
                        <table className="w-full border-collapse border border-gray-300" {...props}>
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ node, ...props }) => <thead className="bg-gray-100" {...props} />,
                    tbody: ({ node, ...props }) => <tbody {...props} />,
                    tr: ({ node, ...props }) => (
                      <tr className="border-b border-gray-300 hover:bg-gray-50" {...props} />
                    ),
                    th: ({ node, ...props }) => (
                      <th
                        className="border border-gray-300 bg-gray-100 px-4 py-2 text-left font-semibold"
                        {...props}
                      />
                    ),
                    td: ({ node, ...props }) => (
                      <td className="border border-gray-300 px-4 py-2 text-left" {...props} />
                    ),
                  }}
                >
                  {msg.message ?? ""}
                </ReactMarkdown>
              </div>
            </div>
          </motion.div>
          {msg.time ? (
            <div className="px-1 text-[10px] text-[#8B91A3]">{msg.time}</div>
          ) : null}
        </div>
      )}

      {/* Feedback Modal */}
      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className=" fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-[650px] rounded-lg bg-white p-6 shadow-md">
            <h2 className="mb-2 text-lg font-medium">
              How was this response?
              {/* {feedback === "liked"
                ? "How was this response?"
                : "How was this response??"} */}
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
                disabled={feedbackLoading}
                className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                onClick={submitFeedback}
              >
                {feedbackLoading ? "saving.." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
