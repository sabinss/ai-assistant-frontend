import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function page() {
  return (
    <div className="p-3 w-full border h-fit  rounded">
      <p className="text-xl"> Review Feedback </p>
      <div className="flex  pt-3 px-1 flex-col gap-2 border-t">
        <p className="text-sm"> Minimum Count:</p>
        <div className="flex w-full">
          {" "}
          <Input type="number" enterKeyHint="enter" />{" "}
        </div>
        <p className="text-sm">Select start date:</p>
        <Input type="date"></Input>
        <p className="text-sm"> Select end date:</p>
        <Input type="date"></Input>
        <div></div>
        <div className="buttons flex justify-end gap-1 ">
          <Button variant="outline">Reset Defaults</Button>
          <Button>Submit</Button>
        </div>
      </div>
    </div>
  );
}
