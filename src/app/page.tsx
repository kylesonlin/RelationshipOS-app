import { OracleSearch } from '@/components/oracle/oracle-search'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            RelationshipOS
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            AI Virtual Assistant for Professional Relationship Management
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Replace $5K/month VAs with $299/month AI Intelligence
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <OracleSearch />
        </div>

        <div className="text-center mt-16 text-sm text-slate-400">
          <p>Powered by GPT-4 • Built with Revolutionary Standards</p>
        </div>
      </div>
    </main>
  )
}
