import { useState } from 'react'
import { FolderOpen, ChevronDown, ChevronRight, XCircle, CheckCircle, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { cases, caseCategories } from '@/data/cases'

export default function Cases() {
  const [selectedCategory, setSelectedCategory] = useState<string>('全部')
  const [expandedCase, setExpandedCase] = useState<string | null>(null)

  const filteredCases = selectedCategory === '全部'
    ? cases
    : cases.filter(c => c.category === selectedCategory)

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="mb-2 text-3xl font-bold flex items-center justify-center gap-2">
          <FolderOpen className="h-8 w-8 text-primary" />
          实战案例库
        </h1>
        <p className="text-muted-foreground">50+错误vs正确对比，快速避坑提升</p>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap justify-center gap-2">
        <Button
          variant={selectedCategory === '全部' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('全部')}
        >
          全部
        </Button>
        {caseCategories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Cases List */}
      <div className="space-y-4">
        {filteredCases.map((caseItem) => (
          <Card key={caseItem.id} className="overflow-hidden">
            <button
              className="w-full"
              onClick={() => setExpandedCase(
                expandedCase === caseItem.id ? null : caseItem.id
              )}
            >
              <CardHeader className="flex flex-row items-center justify-between bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <ArrowLeftRight className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{caseItem.title}</CardTitle>
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                        {caseItem.category}
                      </span>
                    </div>
                  </div>
                </div>
                {expandedCase === caseItem.id ? (
                  <ChevronDown className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                )}
              </CardHeader>
            </button>

            {expandedCase === caseItem.id && (
              <CardContent className="space-y-6 pt-6">
                {/* Wrong Example */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" />
                    错误示例
                  </h3>
                  <pre className="rounded-lg bg-destructive/5 p-4 text-sm overflow-x-auto whitespace-pre-wrap font-mono border-l-4 border-destructive">
                    {caseItem.wrongExample}
                  </pre>
                </div>

                {/* Right Example */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    正确示例
                  </h3>
                  <pre className="rounded-lg bg-green-50 p-4 text-sm overflow-x-auto whitespace-pre-wrap font-mono border-l-4 border-green-500">
                    {caseItem.rightExample}
                  </pre>
                </div>

                {/* Explanation */}
                <div className="rounded-lg bg-primary/5 p-4">
                  <h3 className="font-semibold mb-2">解析</h3>
                  <p className="text-muted-foreground">{caseItem.explanation}</p>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
