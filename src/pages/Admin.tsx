
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Globe, MapPin, Users, Eye, MousePointer, Download, Smartphone, Laptop, Tablet, Monitor, Calendar, TrendingUp } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row'];

const Admin: React.FC = () => {
  const { trackPageView } = useAnalytics();
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPageViews: 0,
    totalClicks: 0,
    totalDownloads: 0,
    totalEvents: 0,
    uniqueCountries: 0,
    topCountry: '',
    desktopUsers: 0,
    mobileUsers: 0,
    tabletUsers: 0,
    otherUsers: 0,
  });

  useEffect(() => {
    document.title = "Analytics Dashboard - Admin";
    trackPageView('Admin Dashboard');
    fetchAnalyticsData();
  }, [trackPageView]);

  const fetchAnalyticsData = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);

      if (error) {
        console.error('Error fetching analytics:', error);
        return;
      }

      setEvents(data || []);
      
      // Calculate stats
      const pageViews = data?.filter(e => e.event_type === 'page_view').length || 0;
      const clicks = data?.filter(e => e.event_type === 'click').length || 0;
      const downloads = data?.filter(e => e.event_type === 'download').length || 0;
      
      // Calculate unique countries and top country
      const countries = data?.filter(e => e.country).map(e => e.country);
      const uniqueCountries = new Set(countries).size;
      const countryCount = countries?.reduce((acc, country) => {
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topCountry = Object.entries(countryCount || {})
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
      
      // Calculate device stats
      const desktopUsers = data?.filter(e => e.channel === 'Desktop').length || 0;
      const mobileUsers = data?.filter(e => e.channel === 'Mobile').length || 0;
      const tabletUsers = data?.filter(e => e.channel === 'Tablet').length || 0;
      const otherUsers = data?.filter(e => e.channel === 'Other').length || 0;
      
      setStats({
        totalPageViews: pageViews,
        totalClicks: clicks,
        totalDownloads: downloads,
        totalEvents: data?.length || 0,
        uniqueCountries,
        topCountry,
        desktopUsers,
        mobileUsers,
        tabletUsers,
        otherUsers,
      });
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeData = () => {
    const eventTypeCounts = events.reduce((acc, event) => {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#4F46E5', '#06B6D4', '#F59E0B', '#EF4444'];
    return Object.entries(eventTypeCounts).map(([type, count], index) => ({
      name: type.replace('_', ' ').toUpperCase(),
      value: count,
      fill: colors[index % colors.length]
    }));
  };

  const getDeviceData = () => {
    return [
      { name: 'Desktop', value: stats.desktopUsers, fill: '#4F46E5' },
      { name: 'Mobile', value: stats.mobileUsers, fill: '#06B6D4' },
      { name: 'Tablet', value: stats.tabletUsers, fill: '#F59E0B' },
      { name: 'Other', value: stats.otherUsers, fill: '#EF4444' }
    ].filter(item => item.value > 0);
  };

  const getTopEvents = () => {
    const eventCounts = events.reduce((acc, event) => {
      acc[event.event_name] = (acc[event.event_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(eventCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  };

  const getTopCountries = () => {
    const countryCounts = events
      .filter(event => event.country)
      .reduce((acc, event) => {
        acc[event.country!] = (acc[event.country!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(countryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([name, count]) => ({ name, count }));
  };

  const getDeviceIcon = (channel: string) => {
    switch (channel) {
      case 'Desktop': return <Laptop className="h-4 w-4" />;
      case 'Mobile': return <Smartphone className="h-4 w-4" />;
      case 'Tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analytics data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          </div>
          <p className="text-gray-600">Real-time insights into your website performance</p>
        </div>
        
        {/* Main Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Total Events</p>
                  <p className="text-2xl lg:text-3xl font-bold">{stats.totalEvents.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Page Views</p>
                  <p className="text-2xl lg:text-3xl font-bold">{stats.totalPageViews.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm font-medium">Clicks</p>
                  <p className="text-2xl lg:text-3xl font-bold">{stats.totalClicks.toLocaleString()}</p>
                </div>
                <MousePointer className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 shadow-lg">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm font-medium">Downloads</p>
                  <p className="text-2xl lg:text-3xl font-bold">{stats.totalDownloads.toLocaleString()}</p>
                </div>
                <Download className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">Countries</p>
                  <p className="text-xl font-bold text-gray-900">{stats.uniqueCountries}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Top Country</p>
                  <p className="text-lg font-bold text-gray-900 truncate">{stats.topCountry}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <Laptop className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Desktop</p>
                  <p className="text-xl font-bold text-gray-900">{stats.desktopUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-pink-600" />
                <div>
                  <p className="text-sm text-gray-600">Mobile</p>
                  <p className="text-xl font-bold text-gray-900">{stats.mobileUsers}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Event Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getEventTypeData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {getEventTypeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Device Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getDeviceData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                    >
                      {getDeviceData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow lg:col-span-2 xl:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Top Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTopEvents()} layout="horizontal">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={60} fontSize={12} />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Countries Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Top Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTopCountries()}>
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} fontSize={12} />
                    <YAxis />
                    <Bar dataKey="count" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-800">
                <Calendar className="h-5 w-5 text-gray-600" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {events.slice(0, 10).map((event) => (
                  <div key={event.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0">
                      {event.channel ? getDeviceIcon(event.channel) : <Monitor className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{event.event_name}</p>
                      <p className="text-xs text-gray-500">
                        {event.city && event.country ? `${event.city}, ${event.country}` : 
                         event.country ? event.country : 'Unknown location'}
                      </p>
                    </div>
                    <div className="text-xs text-gray-400">
                      {new Date(event.created_at).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Events Table */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Device</TableHead>
                    <TableHead className="hidden md:table-cell">Location</TableHead>
                    <TableHead className="hidden lg:table-cell">Page URL</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {events.slice(0, 15).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell className="text-xs">
                        {new Date(event.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          event.event_type === 'page_view' ? 'bg-blue-100 text-blue-800' :
                          event.event_type === 'click' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {event.event_type}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium text-sm max-w-[150px] truncate">
                        {event.event_name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {event.channel ? getDeviceIcon(event.channel) : <Monitor className="h-4 w-4" />}
                          <span className="text-sm">{event.channel || 'Unknown'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 hidden md:table-cell max-w-[150px] truncate">
                        {event.city && event.country ? `${event.city}, ${event.country}` : 
                         event.country ? event.country : 'Unknown'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 hidden lg:table-cell max-w-[200px] truncate">
                        {event.page_url}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;
