import { FaCheckCircle } from "react-icons/fa"

const OutlookLoginButton = ({
  onClick,
  isLoggedIn,
  disabled,
  email,
}: {
  onClick: () => void
  isLoggedIn: boolean
  disabled?: boolean
  email: string | null
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex rounded-lg bg-[#0078d4] p-2.5 font-medium text-white hover:bg-[#106ebe]`}
    >
      {isLoggedIn ? (
        <>
          <FaCheckCircle size={16} className="text-white-600" />
          <span className="ml-4 truncate">
            Disconnect Outlook{" "}
            <strong className="font-semibold text-white">( {email} ) </strong>
          </span>
        </>
      ) : (
        <>
          <svg
            className="mr-3 h-[18px] w-[18px]"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 21 21"
            aria-hidden
          >
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
          </svg>
          <span className="text-bold text-base">Connect to Outlook</span>
        </>
      )}
    </button>
  )
}

export default OutlookLoginButton
