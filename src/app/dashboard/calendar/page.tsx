import { redirect } from 'next/navigation';
import { getServerSession, requireAuth } from '@/lib/auth';
import DashboardLayout from '@/components/dashboard/dashboard-layout';
import { Calendar, Clock, Users, MapPin, ExternalLink, Plus, RefreshCw } from 'lucide-react';

export default async function CalendarDashboardPage() {
  // Check authentication
  const session = await getServerSession();
  if (!session) {
    redirect('/auth/login');
  }

  const authSession = requireAuth(session);
  const { user, organization } = authSession;

  // Mock upcoming meetings data - in production this would come from calendar integration
  const upcomingMeetings = [
    {
      id: 'event_001',
      title: 'Product Strategy Discussion',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      location: 'Conference Room A',
      meetingUrl: 'https://meet.google.com/abc-defg-hij',
      attendees: [
        { email: 'sarah.chen@stripe.com', name: 'Sarah Chen', responseStatus: 'accepted' },
        { email: 'demo@relationshipos.com', name: 'Demo User', responseStatus: 'accepted' }
      ],
      importance: 9,
      preparationStatus: 'ready'
    },
    {
      id: 'event_002',
      title: 'One-on-One with David Rodriguez',
      startTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 24 * 60 * 60 * 1000 + 30 * 60 * 1000).toISOString(),
      location: 'Virtual',
      meetingUrl: 'https://salesforce.zoom.us/j/123456789',
      attendees: [
        { email: 'david.rodriguez@salesforce.com', name: 'David Rodriguez', responseStatus: 'accepted' },
        { email: 'demo@relationshipos.com', name: 'Demo User', responseStatus: 'accepted' }
      ],
      importance: 7,
      preparationStatus: 'pending'
    },
    {
      id: 'event_003',
      title: 'RelationshipOS Demo - Jennifer Park',
      startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
      location: 'Virtual',
      meetingUrl: 'https://meet.google.com/xyz-abcd-efg',
      attendees: [
        { email: 'jennifer.park@openai.com', name: 'Jennifer Park', responseStatus: 'tentative' },
        { email: 'demo@relationshipos.com', name: 'Demo User', responseStatus: 'accepted' }
      ],
      importance: 8,
      preparationStatus: 'not_started'
    }
  ];

  const formatMeetingTime = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    const timeFormatter = new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    
    const dateFormatter = new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    
    const duration = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
    
    return {
      date: dateFormatter.format(start),
      time: `${timeFormatter.format(start)} - ${timeFormatter.format(end)}`,
      duration: `${duration}m`
    };
  };

  const getImportanceColor = (importance: number): string => {
    if (importance >= 8) return 'bg-red-100 text-red-800 border-red-200';
    if (importance >= 6) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  const getPreparationStatusColor = (status: string): string => {
    switch (status) {
      case 'ready': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'not_started': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isUpcoming = (startTime: string): boolean => {
    return new Date(startTime) > new Date();
  };

  return (
    <DashboardLayout user={user} organization={organization}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendar Dashboard</h1>
              <p className="text-gray-600 mt-2">
                AI-powered meeting preparation and relationship intelligence
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Calendar
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Connect Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Calendar Integration Status */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-blue-600 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">Calendar Integration Status</h3>
              <p className="text-sm text-blue-700 mt-1">
                Demo mode active - Connect Google Calendar or Outlook to sync real meetings
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Calendar className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Today&apos;s Meetings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingMeetings.filter(m => {
                    const today = new Date();
                    const meetingDate = new Date(m.startTime);
                    return meetingDate.toDateString() === today.toDateString();
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming</p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingMeetings.filter(m => isUpcoming(m.startTime)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingMeetings.filter(m => m.importance >= 8).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Needs Prep</p>
                <p className="text-2xl font-bold text-gray-900">
                  {upcomingMeetings.filter(m => m.preparationStatus !== 'ready').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Meetings</h2>
            <p className="text-sm text-gray-600 mt-1">
              AI-powered meeting preparation and relationship intelligence
            </p>
          </div>

          <div className="divide-y divide-gray-200">
            {upcomingMeetings.map((meeting) => {
              const timeInfo = formatMeetingTime(meeting.startTime, meeting.endTime);

              return (
                <div key={meeting.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <h3 className="text-lg font-medium text-gray-900">{meeting.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getImportanceColor(meeting.importance)}`}>
                          {meeting.importance >= 8 ? 'High Priority' :
                           meeting.importance >= 6 ? 'Medium Priority' : 'Standard'}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPreparationStatusColor(meeting.preparationStatus)}`}>
                          {meeting.preparationStatus === 'ready' ? 'Prep Ready' :
                           meeting.preparationStatus === 'pending' ? 'Prep Pending' : 'Not Started'}
                        </span>
                      </div>

                      <div className="flex items-center space-x-6 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {timeInfo.date}
                        </div>
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {timeInfo.time} ({timeInfo.duration})
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {meeting.location}
                        </div>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1" />
                          {meeting.attendees.length} attendees
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        {meeting.attendees.slice(0, 3).map((attendee, index) => (
                          <div key={attendee.email} className="flex items-center space-x-2">
                            <div className="h-6 w-6 bg-blue-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-medium">
                                {(attendee.name || attendee.email).charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <span className="text-sm text-gray-700">{attendee.name || attendee.email}</span>
                          </div>
                        ))}
                        {meeting.attendees.length > 3 && (
                          <span className="text-sm text-gray-500">+{meeting.attendees.length - 3} more</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 ml-6">
                      {meeting.meetingUrl && (
                        <a
                          href={meeting.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          Join
                        </a>
                      )}
                      
                      <a
                        href={`/dashboard/calendar/meeting/${meeting.id}`}
                        className="inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Prepare
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Calendar className="h-4 w-4 mr-2" />
              Connect Google Calendar
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Clock className="h-4 w-4 mr-2" />
              Connect Outlook Calendar
            </button>
            <button className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync All Meetings
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 