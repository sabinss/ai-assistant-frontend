"use client"
import { create } from "zustand";

interface User {
    // User properties
}

interface Feedback {
    // Feedback properties
}

interface Source {
    // Source properties
}

// Define interfaces for table states
interface UserTableState {
    limit: number;
    page: number;
    sortColumn: string;
    sortOrder: 'asc' | 'desc';
    search: string;
    deleteStatus: string;
    users: User[]; // Ensure users is always an array, not optional
    totalPages: number; // Add totalPages property
}

interface FeedbackTableState extends Omit<UserTableState, 'users'> {
    startDate: string;
    endDate: string;
    status: string;
    removeState: number;
    feedbacks: Feedback[]; // Specific property for feedbacks
    feedbackType: string; // Specific property for feedback type
}

interface SourceTableState {
    limit: number;
    page: number;
    sortColumn: string;
    sortOrder: 'asc' | 'desc';
    dateProcessed: string;
    status: string;
    search: string;
    sources: Source[]; // Ensure sources is always an array, not optional
    totalPages: number; // Add totalPages property
}

// Define the shape of the store
interface TableStore {
    userTable: UserTableState;
    feedbackTable: FeedbackTableState;
    updateUserTable: <K extends keyof UserTableState>(field: K, value: UserTableState[K]) => void;
    updateFeedbackTable: <K extends keyof FeedbackTableState>(field: K, value: FeedbackTableState[K]) => void;
    sourceTable: SourceTableState;
    updateSourceTable: <K extends keyof SourceTableState>(field: K, value: SourceTableState[K]) => void;
    isMessageLoading: boolean;
    updateMessageLoading: (value: boolean) => void;
}

const useFormStore = create<TableStore>((set) => ({
    userTable: {
        limit: 10,
        page: 1,
        sortColumn: '',
        sortOrder: 'asc',
        search: '',
        users: [], // Initialize with an empty array
        totalPages: 1, // Initialize with 1
        deleteStatus: ""
    },
    sourceTable: {
        limit: 10,
        page: 1,
        sortColumn: '',
        sortOrder: 'asc',
        search: '',
        sources: [], // Initialize with an empty array
        totalPages: 1, // Initialize with 1
        dateProcessed: '',
        status: ""
    },
    updateSourceTable: (field, value) => set((state) => ({
        sourceTable: {
            ...state.sourceTable,
            [field]: value,
        },
    })),
    feedbackTable: {
        feedbackType: "both",
        limit: 10,
        page: 1,
        sortColumn: '',
        sortOrder: 'asc',
        search: '',
        startDate: '',
        deleteStatus: "",
        endDate: '',
        status: 'all',
        removeState: 123,
        feedbacks: [], // Initialize with an empty array for feedbacks
        totalPages: 1, // Initialize with 1
    },
    // Use generics to ensure type safety for field names and values
    updateUserTable: (field, value) => set((state) => ({
        userTable: {
            ...state.userTable,
            [field]: value,
        },
    })),
    updateFeedbackTable: (field, value) => set((state) => ({
        feedbackTable: {
            ...state.feedbackTable,
            [field]: value,
        },
    })),

    isMessageLoading: false,
    updateMessageLoading: (value) => set(() => ({
        isMessageLoading: value,
    }))
}));

export default useFormStore;