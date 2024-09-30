"use client"

import { useState, useCallback, useRef } from "react"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Dropzone } from "@/components/ui/dropzone"
import { Loader2 } from "lucide-react"

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [legoCharacter, setLegoCharacter] = useState<string | null>(null)
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTransforming, setIsTransforming] = useState(false)
  const [aiResponse, setAiResponse] = useState<string>("")

  const previewRef = useRef<HTMLDivElement>(null)

  const handleImageDrop = useCallback((base64Image: string) => {
    setPreviewUrl(base64Image)
    setSelectedFile(null)
  }, [])

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!previewUrl) return

    setIsTransforming(true)
    previewRef.current?.scrollIntoView({ behavior: "smooth" })

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: previewUrl.split(",")[1] }),
      })

      if (response.ok) {
        const data = await response.json()
        const char = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: data }),
        })
        const blockChar = await char.json()
        setLegoCharacter("data:image/jpeg;base64," + blockChar)
      } else {
        console.error("Upload failed")
      }
    } catch (error) {
      console.error("Error uploading image:", error)
    } finally {
      setIsTransforming(false)
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setLegoCharacter(null)
    setMessages([])
    setNewMessage("")
    setAiResponse("")
  }

  const handleAIChat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setAiResponse("")

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages, newMessage }),
      })

      if (!response.ok) throw new Error("Network response was not ok")

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      setMessages((prevMessages) => [
        ...prevMessages,
        { role: "user", content: newMessage },
        { role: "assistant", content: "" },
      ])

      let fullResponse = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullResponse += chunk

        setMessages((prevMessages) => {
          const updatedMessages = [...prevMessages]
          updatedMessages[updatedMessages.length - 1].content = fullResponse
          return updatedMessages
        })

        setAiResponse(fullResponse)
      }

      setNewMessage("")
    } catch (error) {
      console.error("Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center space-y-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-2"
            >
              <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-white drop-shadow-lg">
                Transform Your Photos into LEGO Characters
              </h1>
              <p className="mx-auto max-w-[700px] text-xl text-white md:text-2xl/relaxed lg:text-3xl/relaxed xl:text-4xl/relaxed">
                Upload your image and watch the magic happen!
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-full max-w-sm space-y-2"
            >
              <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
                {previewUrl ? (
                  <div className="relative w-full h-96 rounded-xl overflow-hidden">
                    <Image
                      src={previewUrl}
                      alt="Uploaded Image"
                      layout="fill"
                      objectFit="cover"
                    />
                  </div>
                ) : (
                  <Dropzone
                    onImageDrop={handleImageDrop}
                    previewUrl={previewUrl}
                    className="flex w-full h-64 border-dashed border-4 border-white rounded-xl mx-auto justify-center items-center hover:border-yellow-300 transition-colors duration-200"
                  />
                )}
                <Button
                  type="submit"
                  disabled={!previewUrl}
                  className="w-full bg-gradient-to-r from-yellow-400 to-red-500 hover:from-yellow-500 hover:to-red-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-200 transform hover:scale-105"
                >
                  Transform
                </Button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>
      <AnimatePresence>
        {(previewUrl || legoCharacter) && (
          <motion.section
            ref={previewRef}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.5 }}
            className="w-full py-12 md:py-24 lg:py-32 bg-white bg-opacity-90"
          >
            <div className="px-4 md:px-6 w-full">
              <h2 className="text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600">
                Transformation Preview
              </h2>
              <div className="flex flex-col md:flex-row justify-center items-center gap-8">
                <Card className="w-full max-w-sm bg-gradient-to-br from-yellow-100 to-red-100">
                  <CardContent className="p-4">
                    <div className="aspect-square relative rounded-lg overflow-hidden">
                      {previewUrl ? (
                        <Image
                          src={previewUrl}
                          alt="Original Image"
                          layout="fill"
                          objectFit="cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                          <p>No image selected</p>
                        </div>
                      )}
                    </div>
                    <p className="text-center mt-4 font-medium text-gray-800">Original Image</p>
                  </CardContent>
                </Card>
                <div className="text-5xl font-bold text-yellow-500">→</div>
                <Card className="w-full max-w-sm bg-gradient-to-br from-red-100 to-pink-100">
                  <CardContent className="p-4">
                    <div className="aspect-square relative rounded-lg overflow-hidden">
                      {isTransforming ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 rounded-lg">
                          <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mb-4" />
                          <p className="text-lg font-medium text-gray-600">Transforming...</p>
                        </div>
                      ) : legoCharacter ? (
                        <Image
                          src={legoCharacter}
                          alt="LEGO Character"
                          layout="fill"
                          objectFit="cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200 rounded-lg">
                          <p>Transformed image will appear here</p>
                        </div>
                      )}
                    </div>
                    <p className="text-center mt-4 font-medium text-gray-800">LEGO Character</p>
                  </CardContent>
                </Card>
              </div>
              <div className="mt-8 text-center space-x-4">
                <Button
                  size="lg"
                  disabled={!legoCharacter}
                  className="bg-gradient-to-r from-yellow-400 to-red-500 hover:from-yellow-500 hover:to-red-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-200 transform hover:scale-105"
                >
                  Download LEGO Character
                </Button>
                <Button
                  onClick={handleReset}
                  className="bg-gradient-to-r from-gray-400 to-gray-600 hover:from-gray-500 hover:to-gray-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-200 transform hover:scale-105"
                >
                  Reset
                </Button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-r from-purple-500 via-purple-400 to-pink-500 rounded-xl">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl text-center mb-12 text-white drop-shadow-lg">
            How It Works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Upload Your Image", description: "Choose a photo to get started." },
              { title: "AI Transformation", description: "Our AI creates a LEGO character." },
              { title: "Download & Share", description: "Get your LEGO character and share it!" },
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
              >
                <Card className="bg-white bg-opacity-90 hover:bg-opacity-100 transition-all duration-200 transform hover:scale-105">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-yellow-400 to-red-500 flex items-center justify-center text-white text-3xl font-extrabold mb-4">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-white bg-opacity-90">
        <div className="container px-4 md:px-6">
          <h2 className="text-3xl font-extrabold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-red-600">
            AI Chat
          </h2>
          <div className="max-w-2xl mx-auto">
            <div className="mb-8 space-y-4">
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-lg ${
                    message.role === "user"
                      ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-gray-800"
                      : "bg-gradient-to-r from-red-100 to-pink-100 text-gray-800"
                  }`}
                >
                  <strong>{message.role === "user" ? "You: " : "AI: "}</strong>
                  {message.content}
                </motion.div>
              ))}
            </div>
            <form onSubmit={handleAIChat} className="flex flex-col space-y-4">
              <Input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Ask me anything about LEGO characters!"
                className="flex-grow text-lg p-4 rounded-full border-2 border-yellow-300 focus:border-red-400 focus:ring focus:ring-red-200 transition-all duration-200"
              />
              <Button
                type="submit"
                disabled={isLoading || !newMessage.trim()}
                className="bg-gradient-to-r from-yellow-400 to-red-500 hover:from-yellow-500 hover:to-red-600 text-white font-bold py-3 px-6 rounded-full text-lg transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? "Thinking..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </>
  )
}