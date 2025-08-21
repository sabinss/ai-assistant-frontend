// components/GmailLoginButton.js
import { FaGoogle } from "react-icons/fa"
import { FaCheckCircle } from "react-icons/fa"

const GmailLoginButton = ({ onClick, isLoggedIn, disabled, email }: any) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex rounded-lg bg-[#174894] p-2.5 font-medium text-white hover:bg-[#173094]`}
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
