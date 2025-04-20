// components/DeleteModal.js
import { useState } from "react"
import { FaTrash } from "react-icons/fa"

const DeleteModal = ({ isOpen, onClose, onDelete }: any) => {
  if (!isOpen) return null // Don't render modal if it's not open

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-4 text-lg font-semibold">
          Are you sure you want to delete?
        </h2>
        <p className="mb-4">This action cannot be undone.</p>
        <div className="flex justify-between">
          <button
            className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600"
            onClick={onDelete}
          >
            Disconnect
          </button>
          <button
            className="rounded-md bg-gray-300 px-4 py-2 text-black hover:bg-gray-400"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteModal
