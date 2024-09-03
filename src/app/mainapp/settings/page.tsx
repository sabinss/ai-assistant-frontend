"use client"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import RangeSlider from "../commoncompnents/RangeSlider"
import Dropdown from "../commoncompnents/DropDown"
import { useState, useEffect } from "react"
import http from "@/config/http"
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useAuth from "@/store/user"

export default function Page() {
  const sources = ["gpt-3.5-turbo", "gpt-4", "gpt-4-1106-preview"]
  const { access_token } = useAuth(); // Call useAuth here
  const [organizationData, setOrganizationData] = useState(null)
  const [selectedModel, setSelectedModel] = useState("")
  const [temperature, setTemperature] = useState(0)
  const [apiKey, setApiKey] = useState("")
  const [prompt, setPrompt] = useState("")
  const [greeting, setGreeting] = useState("")
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    apiKey: false,
    prompt: false,
    greeting: false,
  });

  useEffect(() => {
    async function getOrgDetails() {
      try {
        setIsLoading(true);
        const res = await http.get('/organization/', {
          headers: { Authorization: `Bearer ${access_token}` }
        });
        const orgData = res?.data?.org;
        setOrganizationData(orgData)
        setSelectedModel(orgData?.model || 'gpt 3.5 turbo')
        setTemperature(orgData?.temperature !== null && orgData?.temperature !== undefined ? orgData?.temperature : 0)
        setApiKey(orgData?.api || '')
        setPrompt(orgData?.prompt || '')
        setGreeting(orgData?.greeting || '')
      } catch (e) {
        console.log(e)
      } finally {
        setIsLoading(false);
      }
    }
    getOrgDetails()
  }, [access_token])

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      let hasError = false;

      // Reset errors
      setErrors({
        apiKey: false,
        prompt: false,
        greeting: false,
      });

      // Validate fields
      // if (!apiKey) {
      //   setErrors(prevErrors => ({ ...prevErrors, apiKey: true }));
      //   hasError = true;
      // }
      if (!prompt) {
        setErrors(prevErrors => ({ ...prevErrors, prompt: true }));
        hasError = true;
      }
      // if (!greeting) {
      //   setErrors(prevErrors => ({ ...prevErrors, greeting: true }));
      //   hasError = true;
      // }

      if (hasError) {
        return;
      }

      const data = {
        selectedModel,
        temperature,
        apiKey,
        prompt,
        greeting
      }

      await http.patch('/organization', data, {
        headers: { Authorization: `Bearer ${access_token}` }
      })
      toast.success('Organization data updated successfully')
    } catch (e) {
      console.log('Error updating organization data', e)
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mb-4 h-fit w-full rounded-lg border bg-white px-5 py-6 text-[#333333] relative">
      {isLoading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-200 bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      )}
      <h1 className="text-2xl font-semibold">AI Product Assistant</h1>

      <div className="flex flex-col gap-4">
        <div className="gptselect md:w-1/2 mt-4 ">
          <h3 className="font-semibold mb-6 tracking-widest">Select GPT Model</h3>
          <Dropdown
            options={sources}
            value={selectedModel}
            onChange={(value) => setSelectedModel(value)}
          />
        </div>

        <div className="temperature mt-4">
          <p className="font-semibold mb-4 tracking-widest">Temperature</p>
          <RangeSlider
            defaultValue={temperature}
            onChange={(value) => setTemperature(value)}
          />
        </div>

        <div className="apikeyflex mt-4 flex-col md:w-1/2">
          <h3 className="text-sm text-primary">Your Api key</h3>
          <Input
            className={`mt-2 ${errors.apiKey ? 'border-red-500' : ''}`}
            placeholder="Your Api key will be here"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          {errors.apiKey && <span className="text-red-500">API key cannot be empty</span>}
        </div>

        <div className="prompt mt-4">
          <h3 className="text-sm">Enter your Greeting</h3>
          <Textarea
            className={`mt-2 bg-[#F7f7f7] border-[#CCCCCC] ${errors.greeting ? 'border-red-500' : ''}`}
            rows={10}
            placeholder="Type your Greeting..."
            value={greeting}
            onChange={(e) => setGreeting(e.target.value)}
          />
          {errors.greeting && <span className="text-red-500">Greeting cannot be empty</span>}
        </div>

        <div className="prompt mt-4">
          <h3 className="text-sm">Enter your prompt</h3>
          <Textarea
            className={`mt-2 bg-[#F7f7f7] border-[#CCCCCC] ${errors.prompt ? 'border-red-500' : ''}`}
            rows={10}
            placeholder="Type your prompt here..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          {errors.prompt && <span className="text-red-500">Prompt cannot be empty</span>}
        </div>

        <div className="w-full"></div>

        <div className="buttons mt-3 md:flex w-full md:justify-end">
          <Button
            className="bg-[#174894] md:inline block w-full md:w-auto"
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  )
}