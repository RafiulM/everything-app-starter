"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Copy, Check, Terminal, Send, Search, Image } from "@tabler/icons-react"
import { toast } from "sonner"

export function ApiUsageExample() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedCode(text)
      toast.success(`${label} copied to clipboard`)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const codeExamples = {
    curl: {
      chat: `# Chat API Example
curl -X POST https://your-domain.com/api/chat \\
  -H "Authorization: Bearer ak_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Hello, how can you help me today?"
      }
    ],
    "model": "gpt-3.5-turbo",
    "temperature": 0.7
  }'`,
      search: `# Search API Example
curl -X POST https://your-domain.com/api/search \\
  -H "Authorization: Bearer ak_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "query": "What is artificial intelligence?",
    "maxResults": 5
  }'`,
      image: `# Image Generation API Example
curl -X POST https://your-domain.com/api/images \\
  -H "Authorization: Bearer ak_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A serene mountain landscape at sunset",
    "size": "1024x1024",
    "quality": "standard",
    "style": "vivid"
  }'`,
    },
    javascript: {
      chat: `// Chat API Example (JavaScript)
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ak_your_api_key_here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    messages: [
      {
        role: 'user',
        content: 'Hello, how can you help me today?'
      }
    ],
    model: 'gpt-3.5-turbo',
    temperature: 0.7
  })
});

if (response.ok) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    console.log(chunk); // Streaming response
  }
}`,
      search: `// Search API Example (JavaScript)
const response = await fetch('/api/search', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ak_your_api_key_here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: 'What is artificial intelligence?',
    maxResults: 5
  })
});

const result = await response.json();
console.log(result.data.answer);
console.log(result.data.results);`,
      image: `// Image Generation API Example (JavaScript)
const response = await fetch('/api/images', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ak_your_api_key_here',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    prompt: 'A serene mountain landscape at sunset',
    size: '1024x1024',
    quality: 'standard',
    style: 'vivid'
  })
});

const result = await response.json();
console.log('Image URL:', result.data.imageUrl);
console.log('Description:', result.data.description);`,
    },
    python: {
      chat: `# Chat API Example (Python)
import requests

response = requests.post(
    'https://your-domain.com/api/chat',
    headers={
        'Authorization': 'Bearer ak_your_api_key_here',
        'Content-Type': 'application/json',
    },
    json={
        'messages': [
            {
                'role': 'user',
                'content': 'Hello, how can you help me today?'
            }
        ],
        'model': 'gpt-3.5-turbo',
        'temperature': 0.7
    },
    stream=True
)

for line in response.iter_lines():
    if line:
        print(line.decode('utf-8'))  # Streaming response`,
      search: `# Search API Example (Python)
import requests

response = requests.post(
    'https://your-domain.com/api/search',
    headers={
        'Authorization': 'Bearer ak_your_api_key_here',
        'Content-Type': 'application/json',
    },
    json={
        'query': 'What is artificial intelligence?',
        'maxResults': 5
    }
)

result = response.json()
print('Answer:', result['data']['answer'])
print('Results:', result['data']['results'])`,
      image: `# Image Generation API Example (Python)
import requests

response = requests.post(
    'https://your-domain.com/api/images',
    headers={
        'Authorization': 'Bearer ak_your_api_key_here',
        'Content-Type': 'application/json',
    },
    json={
        'prompt': 'A serene mountain landscape at sunset',
        'size': '1024x1024',
        'quality': 'standard',
        'style': 'vivid'
    }
)

result = response.json()
print('Image URL:', result['data']['imageUrl'])
print('Description:', result['data']['description'])`,
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>API Usage Examples</CardTitle>
        <CardDescription>
          Learn how to use your API keys to integrate with our AI services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="curl" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="curl" className="flex items-center gap-2">
                <Terminal className="h-4 w-4" />
                cURL
              </TabsTrigger>
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
            </TabsList>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Send className="h-5 w-5" />
                Chat API
              </h3>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                <TabsContent value="curl">
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{codeExamples.curl.chat}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.curl.chat, "cURL chat example")}
                    >
                      {copiedCode === codeExamples.curl.chat ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="javascript">
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{codeExamples.javascript.chat}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.javascript.chat, "JavaScript chat example")}
                    >
                      {copiedCode === codeExamples.javascript.chat ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="python">
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{codeExamples.python.chat}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.python.chat, "Python chat example")}
                    >
                      {copiedCode === codeExamples.python.chat ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search API
              </h3>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                <TabsContent value="curl">
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{codeExamples.curl.search}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.curl.search, "cURL search example")}
                    >
                      {copiedCode === codeExamples.curl.search ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="javascript">
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{codeExamples.javascript.search}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.javascript.search, "JavaScript search example")}
                    >
                      {copiedCode === codeExamples.javascript.search ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="python">
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{codeExamples.python.search}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.python.search, "Python search example")}
                    >
                      {copiedCode === codeExamples.python.search ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Image className="h-5 w-5" />
                Image Generation API
              </h3>
              <Tabs defaultValue="curl" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="curl">cURL</TabsTrigger>
                  <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                  <TabsTrigger value="python">Python</TabsTrigger>
                </TabsList>
                <TabsContent value="curl">
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{codeExamples.curl.image}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.curl.image, "cURL image example")}
                    >
                      {copiedCode === codeExamples.curl.image ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="javascript">
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{codeExamples.javascript.image}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.javascript.image, "JavaScript image example")}
                    >
                      {copiedCode === codeExamples.javascript.image ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="python">
                  <div className="relative">
                    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                      <code>{codeExamples.python.image}</code>
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(codeExamples.python.image, "Python image example")}
                    >
                      {copiedCode === codeExamples.python.image ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </Tabs>

        <div className="mt-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Required Scopes</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">chat:write</Badge>
              <Badge variant="outline">search:write</Badge>
              <Badge variant="outline">image:write</Badge>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-semibold text-yellow-900 mb-2">Important Notes</h4>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Replace `ak_your_api_key_here` with your actual API key</li>
              <li>• Keep your API keys secure and never expose them in client-side code</li>
              <li>• Ensure your API key has the required scopes for each endpoint</li>
              <li>• Monitor your API usage and rotate keys regularly</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}