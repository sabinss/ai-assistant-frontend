// components/GmailLoginButton.js
import { FaGoogle } from "react-icons/fa"
import { FaCheckCircle } from "react-icons/fa"

const GmailLoginButton = ({ onClick, isLoggedIn, disabled }: any) => {
  console.log("isLoggedIn", isLoggedIn)
  return (
    <button
      disabled={isLoggedIn || disabled}
      onClick={onClick}
      className="flex h-12 items-center justify-center gap-2 rounded-lg bg-red-500 px-6 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
    >
      {isLoggedIn ? <FaCheckCircle size={14} /> : <FaGoogle size={18} />}
      <span>{isLoggedIn ? "You are logged In" : "Sign in with Gmail"}</span>
    </button>
  )
}

export default GmailLoginButton
