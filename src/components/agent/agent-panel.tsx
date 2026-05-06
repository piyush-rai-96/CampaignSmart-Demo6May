import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import type { AgentMessage } from '@/types'

interface AgentPanelProps {
  messages: AgentMessage[]
  onSendMessage?: (message: string) => void
  isThinking?: boolean
  minimized?: boolean
}

export function AgentPanel({ messages, onSendMessage, isThinking, minimized: initialMinimized }: AgentPanelProps) {
  const [isMinimized, setIsMinimized] = useState(initialMinimized ?? false)
  const [inputValue, setInputValue] = useState('')

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <div className="w-80 bg-surface border-l border-border h-full flex flex-col">
      {/* Header */}
      <div 
        className="p-4 border-b border-border flex items-center justify-between cursor-pointer hover:bg-surface-secondary transition-colors"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-agent to-primary flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Campaign Agent</h3>
            <p className="text-xs text-text-muted">
              {isThinking ? 'Thinking...' : 'Ready to help'}
            </p>
          </div>
        </div>
        <button className="text-text-muted hover:text-text-primary transition-colors">
          {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    'rounded-lg p-3',
                    message.isUser
                      ? 'bg-primary text-white ml-8'
                      : 'bg-agent-light text-text-primary mr-4'
                  )}
                >
                  {!message.isUser && (
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-3 h-3 text-agent" />
                      <span className="text-xs font-medium text-agent">Agent</span>
                    </div>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </motion.div>
              ))}

              {isThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-agent-light rounded-lg p-3 mr-4"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-agent animate-pulse" />
                    <span className="text-xs font-medium text-agent">Thinking...</span>
                  </div>
                  <div className="flex gap-1 mt-2">
                    <span className="w-2 h-2 bg-agent/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-agent/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-agent/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask the agent..."
                  className="flex-1 px-3 py-2 text-sm bg-surface-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-agent/50 focus:border-agent"
                />
                <Button
                  size="sm"
                  onClick={handleSend}
                  disabled={!inputValue.trim()}
                  className="bg-agent hover:bg-agent/90"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
