import { Suspense } from 'react'
import Wrapper from "./wrapper";
export default function Page() {
    return (
        <Suspense>
            <Wrapper />
        </Suspense>
    )
}