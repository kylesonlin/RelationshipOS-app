import OracleSearch from '@/components/oracle/oracle-search'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8">
        <OracleSearch />
      </div>
    </main>
  )
}
