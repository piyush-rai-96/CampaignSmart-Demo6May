import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { Sparkles, Send, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
// @ts-expect-error – impact-ui ships JS source; no type declarations
import { Button } from 'impact-ui/src/components/Button/index.js'
import type { AgentMessage } from '@/types'
import './agent-flow.css'

interface AgentPanelProps {
  messages: AgentMessage[]
  onSendMessage?: (message: string) => void
  isThinking?: boolean
  minimized?: boolean
}

export function AgentPanel({ messages, onSendMessage, isThinking, minimized: initialMinimized }: AgentPanelProps) {
  const [isMinimized, setIsMinimized] = useState(initialMinimized ?? false)
  const [inputValue, setInputValue] = useState('')
  const reduceMotion = useReducedMotion()

  const handleSend = () => {
    if (inputValue.trim() && onSendMessage) {
      onSendMessage(inputValue.trim())
      setInputValue('')
    }
  }

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-80 bg-surface border-l border-border h-full flex flex-col"
    >
      {/* Header */}
      <div
        className="p-4 border-b border-border flex items-center justify-between cursor-pointer hover:bg-surface-secondary transition-colors"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <motion.div className="flex items-center gap-3" layout>
          <div className="agent-flow-orb-wrap h-8 w-8 rounded-lg">
            {isThinking && (
              <div
                className="agent-flow-orb-ring h-8 w-8 rounded-lg"
                style={{ animation: reduceMotion ? undefined : 'agent-ring-spin 1s linear infinite' }}
                aria-hidden
              />
            )}
            <motion.div
              className={cn(
                'relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-agent to-primary',
                isThinking && 'agent-flow-orb'
              )}
              animate={reduceMotion || !isThinking ? {} : { scale: [1, 1.06, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-white" />
            </motion.div>
          </div>
          <div>
            <h3 className="font-semibold text-text-primary text-sm">Campaign Agent</h3>
            <motion.p
              key={isThinking ? 'thinking' : 'ready'}
              initial={reduceMotion ? false : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn('text-xs', isThinking ? 'text-agent font-medium' : 'text-text-muted')}
            >
              {isThinking ? 'Thinking...' : 'Ready to help'}
            </motion.p>
          </div>
        </motion.div>
        <button type="button" className="text-text-muted hover:text-text-primary transition-colors" aria-label={isMinimized ? 'Expand panel' : 'Minimize panel'}>
          {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence>
        {!isMinimized && (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Messages */}
            <motion.div className="flex-1 overflow-y-auto p-4 space-y-4" layout>
              <AnimatePresence initial={false}>
                {messages.map((message, i) => (
                  <motion.div
                    key={message.id}
                    initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      delay: reduceMotion ? 0 : Math.min(i * 0.04, 0.2),
                      type: 'spring',
                      stiffness: 380,
                      damping: 28,
                    }}
                    className={cn(
                      'rounded-lg p-3',
                      message.isUser
                        ? 'bg-primary text-white ml-8'
                        : 'bg-agent-light text-text-primary mr-4'
                    )}
                  >
                    {!message.isUser && (
                      <motion.div className="flex items-center gap-2 mb-2">
                        <Sparkles className="w-3 h-3 text-agent" />
                        <span className="text-xs font-medium text-agent">Agent</span>
                      </motion.div>
                    )}
                    <p className="text-sm leading-relaxed">{message.content}</p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isThinking && (
                <motion.div
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="agent-flow-panel bg-agent-light rounded-lg p-3 mr-4 border border-agent/15"
                >
                  <div className="flex items-center gap-2 relative z-[1]">
                    <motion.div
                      animate={reduceMotion ? {} : { rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkles className="w-3 h-3 text-agent" />
                    </motion.div>
                    <span className="text-xs font-medium text-agent">Thinking...</span>
                  </div>
                  <div className="flex gap-1.5 mt-3 relative z-[1]">
                    {[0, 1, 2].map((dot) => (
                      <motion.span
                        key={dot}
                        className="w-2 h-2 bg-agent/50 rounded-full"
                        animate={reduceMotion ? {} : { y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                        transition={{
                          duration: 0.7,
                          repeat: Infinity,
                          delay: dot * 0.12,
                          ease: 'easeInOut',
                        }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>

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
    </motion.div>
  )
}
