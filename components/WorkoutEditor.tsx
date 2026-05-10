'use client'
import { useState } from 'react'
import { X, Plus, GripVertical, Copy, Trash2 } from 'lucide-react'

const WORKOUT_TITLES = [
  'ריצה קלה', 'אינטרוולים', 'סף', 'פארטלק', 'טמפו',
  'Long Run', 'התאוששות', 'עליות', 'מבחן', 'תחרות',
  'כוח', 'מוביליטי', 'דריל', 'כפולה'
]

const CHIPS: Record<string, string[]> = {
  מבנה: ['תרגילים ומתגברות', 'חימום', 'שחרור', 'סט', 'סטים', 'חזרה', 'חזרות', 'מנוחה', 'ג׳וג', 'הליכה', 'כפולה', 'ריצה ארוכה', 'אימון מרכזי', 'אימון בוקר', 'אימון ערב'],
  עצימות: [ '@', 'קצב','קל', 'קליל', 'נוח', 'אירובי', 'מתפתח', 'סף', 'סף קל', 'טמפו', 'פארטלק', 'מהיר', 'חזק', 'ספרינט', 'VO2 Max', 'T1', 'T2', 'Race Pace', 'קצב תחרות', 'קצב סף'],
  זמן: ['שניות', 'דקות', 'שעה', 'דקה', 'שניה', 'דקות מנוחה', 'שניות מנוחה'],
  מרחק: ['מטר', 'ק"מ', 'קילומטר'],
  משטח: ['מסלול', 'דשא', 'כביש', 'מסילה', 'שטח', 'עליות', 'טבעת'],
  מנוחה: ['מנוחה מלאה', 'מנוחה קצרה', 'ג׳וג קל', 'הליכה', 'מעבר', 'התאוששות אקטיבית'],
  סוג: ['ריצה', 'שחייה', 'אופניים',  'כוח מלא', 'מוביליטי','קצב מתפתח','מהיר וטכני','עליות אלקטיות קצרות','על אזור סף','צריך להרגיש מאוד נוח' ,'מדגברות', 'מתיחות', 'טכניקה', 'מדרגות', 'עליות', 'ירידות'],
}

type BlockType = 'set' | 'note' | 'rest'

interface Block {
  id: string
  type: BlockType
  text: string
}

interface WorkoutEditorProps {
  date: string
  onClose: () => void
  onSave: (workout: { title: string; blocks: Block[]; date: string }) => void
}

export function WorkoutEditor({ date, onClose, onSave }: WorkoutEditorProps) {
  const [title, setTitle] = useState(WORKOUT_TITLES[0])
  const [blocks, setBlocks] = useState<Block[]>([
    { id: '1', type: 'set', text: '' }
  ])
  const [activeBlock, setActiveBlock] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState('מבנה')

  const addBlock = (type: BlockType) => {
    const newBlock: Block = {
      id: Date.now().toString(),
      type,
      text: type === 'rest' ? 'מנוחה' : ''
    }
    setBlocks(prev => [...prev, newBlock])
  }

  const updateBlock = (id: string, text: string) => {
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, text } : b))
  }

  const duplicateBlock = (id: string) => {
    const block = blocks.find(b => b.id === id)
    if (!block) return
    const newBlock = { ...block, id: Date.now().toString() }
    const index = blocks.findIndex(b => b.id === id)
    const newBlocks = [...blocks]
    newBlocks.splice(index + 1, 0, newBlock)
    setBlocks(newBlocks)
  }

  const deleteBlock = (id: string) => {
    if (blocks.length === 1) return
    setBlocks(prev => prev.filter(b => b.id !== id))
  }

  const appendToBlock = (id: string, text: string) => {
    setBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, text: b.text ? `${b.text} ${text}` : text } : b
    ))
  }

  const BLOCK_STYLES: Record<BlockType, string> = {
    set: 'border-blue-200 bg-blue-50/30',
    note: 'border-yellow-200 bg-yellow-50/30',
    rest: 'border-gray-200 bg-gray-50/30',
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" dir="rtl">

        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-bold text-navy text-lg">אימון חדש — {date}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Title selector */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">סוג אימון</label>
            <div className="flex flex-wrap gap-2">
              {WORKOUT_TITLES.map(t => (
                <button
                  key={t}
                  onClick={() => setTitle(t)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                    title === t
                      ? 'bg-navy text-white border-navy'
                      : 'border-gray-200 text-gray-600 hover:border-navy/50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Blocks */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-2 block">תוכן האימון</label>
            <div className="space-y-2">
              {blocks.map((block) => (
                <div key={block.id} className={`border rounded-xl p-3 transition ${BLOCK_STYLES[block.type]}`}>
                  <div className="flex items-start gap-2">
                    <GripVertical className="w-4 h-4 text-gray-300 mt-1 cursor-grab flex-shrink-0" />
                    <input
                      className="flex-1 bg-transparent outline-none text-sm text-navy placeholder-gray-300 min-w-0"
                      placeholder={
                        block.type === 'set' ? 'לדוגמה: חימום סף אירובי' :
                        block.type === 'note' ? 'הערה...' : 'מנוחה'
                      }
                      value={block.text}
                      onChange={e => updateBlock(block.id, e.target.value)}
                      onFocus={() => setActiveBlock(block.id)}
                    />
                    <button onClick={() => duplicateBlock(block.id)} className="p-1 hover:bg-white/80 rounded text-gray-400 hover:text-gray-600 flex-shrink-0">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteBlock(block.id)} className="p-1 hover:bg-white/80 rounded text-gray-400 hover:text-red-500 flex-shrink-0">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {activeBlock === block.id && (
                    <div className="mt-2.5">
                      {/* Category tabs */}
                      <div className="flex gap-1 flex-wrap mb-2">
                        {Object.keys(CHIPS).map(cat => (
                          <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-2 py-0.5 text-xs rounded-full transition ${
                              activeCategory === cat
                                ? 'bg-navy text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:border-navy/50'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                      {/* Chips */}
                      <div className="flex flex-wrap gap-1">
                        {CHIPS[activeCategory].map(chip => (
                          <button
                            key={chip}
                            onClick={() => appendToBlock(block.id, chip)}
                            className="px-2 py-0.5 text-xs bg-white border border-blue-200 rounded-full hover:bg-blue-50 hover:border-blue-400 text-blue-700 transition"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add buttons */}
            <div className="flex gap-2 mt-3">
              <button onClick={() => addBlock('set')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-dashed border-blue-300 text-blue-500 rounded-lg hover:bg-blue-50 transition">
                <Plus className="w-3.5 h-3.5" /> הוסף סט
              </button>
              <button onClick={() => addBlock('note')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-dashed border-yellow-300 text-yellow-600 rounded-lg hover:bg-yellow-50 transition">
                <Plus className="w-3.5 h-3.5" /> הוסף הערה
              </button>
              <button onClick={() => addBlock('rest')}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-dashed border-gray-300 text-gray-500 rounded-lg hover:bg-gray-50 transition">
                <Plus className="w-3.5 h-3.5" /> מנוחה
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-4 border-t border-gray-100 flex-shrink-0">
          <button onClick={onClose}
            className="flex-1 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition text-sm font-medium">
            ביטול
          </button>
          <button onClick={() => onSave({ title, blocks, date })}
            className="flex-1 py-2.5 bg-navy text-white rounded-xl hover:bg-navy/90 transition text-sm font-medium">
            שמור אימון
          </button>
        </div>
      </div>
    </div>
  )
}