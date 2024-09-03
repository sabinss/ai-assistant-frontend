import * as React from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import CardContents from "./cardcontents"
//source
export default function Page() {
    return (
        <div className="flex w-full justify-center ">
            <div className="card ">
                <Card className="">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Add new Source
                        </CardTitle>
                        <CardDescription>
                            Add new sources to use for training your chatbot.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <CardContents />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

