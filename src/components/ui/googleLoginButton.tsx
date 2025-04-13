// components/GmailLoginButton.js
import { FaGoogle } from "react-icons/fa"
import { FaCheckCircle } from "react-icons/fa"

// const GmailLoginButton = ({ onClick, isLoggedIn, disabled, email }: any) => {
//   console.log("isLoggedIn", isLoggedIn)
//   return (
//     <button
//       disabled={isLoggedIn || disabled}
//       onClick={onClick}
//       className="flex h-12 items-center justify-center gap-2 rounded-lg bg-red-500 px-6 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
//     >
//       {/* <a
//       href="#"
//       onClick={onClick}
//       className={`flex items-center gap-2 text-sm font-medium text-blue-500 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 ${isLoggedIn || disabled ? "cursor-not-allowed" : ""}`}
//       style={{ textDecoration: "none" }}
//     > */}
//       {isLoggedIn && <FaCheckCircle size={14} />}
//       <span>
//         {isLoggedIn
//           ? `You're all set! You're logged in as ${email}`
//           : "  Authorize access to your email box"}
//       </span>
//       {/* </a> */}
//       <FaGoogle size={18} />
//     </button>
//   )
// }

const GmailLoginButton = ({ onClick, isLoggedIn, disabled, email }: any) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center rounded-lg bg-red-500 p-2 pr-2 text-white`}
    >
      {isLoggedIn ? (
        <>
          <FaCheckCircle size={16} className="text-white-600" />
          <span className="ml-4 truncate">
            Disconnect from Email Box{" "}
            <strong className="font-semibold text-white">( {email} ) </strong>
          </span>
        </>
      ) : (
        <>
          <FaGoogle size={18} className="mr-3 " />
          <span className="text-bold text-base">Connect to Email Box</span>
        </>
      )}
    </button>
  )
}

export default GmailLoginButton
