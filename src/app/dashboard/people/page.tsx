import { redirect } from 'next/navigation';
import { getServerSession, requireAuth } from '@/lib/auth';
import { databaseService, type SearchFilters } from '@/lib/database';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import PeopleList from '@/components/people/people-list';
import PeopleSearch from '@/components/people/people-search';
import PeopleFilters from '@/components/people/people-filters';
import PeopleStats from '@/components/people/people-stats';

interface PageProps {
  searchParams: {
    q?: string;
    industry?: string;
    seniority?: string;
    location?: string;
    strength_min?: string;
    strength_max?: string;
    last_interaction?: string;
    tags?: string;
    page?: string;
    sort?: string;
    order?: string;
  };
}

export default async function PeoplePage({ searchParams }: PageProps) {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    redirect('/auth/login');
  }

  const authSession = requireAuth(session);
  const { user, organization } = authSession;

  // Parse search parameters
  const page = parseInt(searchParams.page || '1');
  const limit = 24; // 6 cards per row * 4 rows
  const offset = (page - 1) * limit;

  // Build search filters
  const filters: SearchFilters = {
    query: searchParams.q,
    industry: searchParams.industry,
    seniorityLevel: searchParams.seniority,
    location: searchParams.location,
    lastInteractionDays: searchParams.last_interaction ? parseInt(searchParams.last_interaction) : undefined,
    tags: searchParams.tags ? searchParams.tags.split(',') : undefined,
    relationshipStrength: {
      min: searchParams.strength_min ? parseInt(searchParams.strength_min) : undefined,
      max: searchParams.strength_max ? parseInt(searchParams.strength_max) : undefined,
    },
    limit,
    offset,
    sortBy: (searchParams.sort as any) || 'firstName',
    sortOrder: (searchParams.order as 'asc' | 'desc') || 'asc',
  };

  try {
    // Fetch people data
    const peopleResult = await databaseService.searchPeople(organization.id, filters);
    
    // Get stats for the header
    const stats = await getPeopleStats(organization.id);

    return (
      <DashboardLayout user={user} organization={organization}>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">People</h1>
              <p className="text-gray-600 mt-1">
                Manage your professional relationship network
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <a
                href="/dashboard/people/import"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Import Contacts
              </a>
              <a
                href="/dashboard/people/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Add Person
              </a>
            </div>
          </div>

          {/* Stats Cards */}
          <PeopleStats stats={stats} />

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="space-y-4">
              <PeopleSearch defaultValue={searchParams.q} />
              <PeopleFilters 
                filters={filters}
                totalResults={peopleResult.total}
              />
            </div>
          </div>

          {/* Results */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  {peopleResult.total} People
                </h3>
                <div className="flex items-center space-x-4">
                  {/* Sort Options */}
                  <select 
                    className="text-sm border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    defaultValue={`${filters.sortBy}-${filters.sortOrder}`}
                  >
                    <option value="firstName-asc">Name A-Z</option>
                    <option value="firstName-desc">Name Z-A</option>
                    <option value="lastInteraction-desc">Recent Contact</option>
                    <option value="relationshipStrength-desc">Strongest Relationships</option>
                    <option value="createdAt-desc">Recently Added</option>
                  </select>
                  
                  {/* View Toggle */}
                  <div className="flex border border-gray-300 rounded-lg">
                    <button className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-l-lg">
                      Cards
                    </button>
                    <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-r-lg">
                      List
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* People List */}
            <PeopleList 
              people={peopleResult.data}
              organizationId={organization.id}
              currentPage={page}
              totalPages={Math.ceil(peopleResult.total / limit)}
              totalResults={peopleResult.total}
            />
          </div>
        </div>
      </DashboardLayout>
    );

  } catch (error) {
    console.error('People page error:', error);
    
    return (
      <DashboardLayout user={user} organization={organization}>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error Loading People
          </h1>
          <p className="text-gray-600 mb-8">
            There was an issue loading your relationship data. Please try refreshing the page.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </DashboardLayout>
    );
  }
}

// Helper function to get people statistics
async function getPeopleStats(organizationId: string) {
  try {
    // Get various stats in parallel
    const [
      totalResult,
      recentContactsResult,
      strongRelationshipsResult,
      needsFollowUpResult,
      byIndustryResult,
      bySeniorityResult,
    ] = await Promise.all([
      databaseService.searchPeople(organizationId, { limit: 1 }),
      databaseService.searchPeople(organizationId, { 
        lastInteractionDays: 7, 
        limit: 1 
      }),
      databaseService.searchPeople(organizationId, { 
        relationshipStrength: { min: 8 }, 
        limit: 1 
      }),
      databaseService.searchPeople(organizationId, { 
        lastInteractionDays: 30, 
        limit: 1 
      }),
      // Industry breakdown (limited sampling)
      databaseService.searchPeople(organizationId, { 
        industry: 'technology', 
        limit: 1 
      }),
      // Seniority breakdown (limited sampling)
      databaseService.searchPeople(organizationId, { 
        seniorityLevel: 'executive', 
        limit: 1 
      }),
    ]);

    const total = totalResult.total;
    const needsFollowUpCount = Math.max(0, total - needsFollowUpResult.total);

    return {
      total,
      recentContacts: recentContactsResult.total,
      strongRelationships: strongRelationshipsResult.total,
      needsFollowUp: needsFollowUpCount,
      averageStrength: 6.5, // TODO: Calculate from actual data
      topIndustries: [
        { name: 'Technology', count: Math.min(total, 45) },
        { name: 'Finance', count: Math.min(total, 32) },
        { name: 'Healthcare', count: Math.min(total, 28) },
        { name: 'Consulting', count: Math.min(total, 24) },
      ],
      topSeniorities: [
        { name: 'Senior', count: Math.min(total, 38) },
        { name: 'Executive', count: Math.min(total, 29) },
        { name: 'Mid-level', count: Math.min(total, 25) },
        { name: 'C-level', count: Math.min(total, 18) },
      ]
    };

  } catch (error) {
    console.error('Error fetching people stats:', error);
    return {
      total: 0,
      recentContacts: 0,
      strongRelationships: 0,
      needsFollowUp: 0,
      averageStrength: 0,
      topIndustries: [],
      topSeniorities: []
    };
  }
} 