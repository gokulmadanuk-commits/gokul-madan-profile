
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Globe, MapPin, Users, Eye, MousePointer, Download, Smartphone, Laptop, Tablet, Monitor, Calendar, TrendingUp, Chrome, Globe2 } from 'lucide-react';
import EventsTable from '@/components/EventsTable';
import type { Database } from '@/integrations/supabase/types';

type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row'];

const Admin: React.FC = () => {
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
    topBrowser: '',
    topOS: '',
    uniqueSessions: 0,
  });

  useEffect(() => {
    document.title = "Analytics Dashboard - Admin";
    // Removed trackPageView for admin dashboard
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1000);

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
      
      // Calculate browser and OS stats
      const browsers = data?.filter(e => e.browser).map(e => e.browser);
      const browserCount = browsers?.reduce((acc, browser) => {
        acc[browser] = (acc[browser] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topBrowser = Object.entries(browserCount || {})
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
      
      const osData = data?.filter(e => e.operating_system).map(e => e.operating_system);
      const osCount = osData?.reduce((acc, os) => {
        acc[os] = (acc[os] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      const topOS = Object.entries(osCount || {})
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Unknown';
      
      // Calculate unique sessions
      const sessions = data?.filter(e => e.session_id).map(e => e.session_id);
      const uniqueSessions = new Set(sessions).size;
      
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
        topBrowser,
        topOS,
        uniqueSessions,
      });
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventTypeData = () => {
    const eventTypeCounts = events.reduce((acc, event) => {
      const eventType = event.event_type.replace('_', ' ').toUpperCase();
      acc[eventType] = (acc[eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#4F46E5', '#06B6D4', '#F59E0B', '#EF4444', '#10B981'];
    return Object.entries(eventTypeCounts).map(([type, count], index) => ({
      name: type,
      value: count,
      fill: colors[index % colors.length]
    }));
  };

  const getDeviceData = () => {
    const deviceCounts = events.reduce((acc, event) => {
      const device = event.channel || 'Other';
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#4F46E5', '#06B6D4', '#F59E0B', '#EF4444'];
    return Object.entries(deviceCounts).map(([device, count], index) => ({
      name: device,
      value: count,
      fill: colors[index % colors.length]
    })).filter(item => item.value > 0);
  };

  const getBrowserData = () => {
    const browserCounts = events
      .filter(event => event.browser)
      .reduce((acc, event) => {
        acc[event.browser!] = (acc[event.browser!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    const colors = ['#4F46E5', '#06B6D4', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6'];
    return Object.entries(browserCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([browser, count], index) => ({
        name: browser,
        value: count,
        fill: colors[index % colors.length]
      }));
  };

  const getTopEvents = () => {
    const eventCounts = events.reduce((acc, event) => {
      acc[event.event_name] = (acc[event.event_name] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(eventCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 15) + '...' : name, count }));
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
      .slice(0, 6)
      .map(([name, count]) => ({ name: name.length > 12 ? name.slice(0, 12) + '...' : name, count }));
  };

  const getTopCities = () => {
    const cityCounts = events
      .filter(event => event.city)
      .reduce((acc, event) => {
        const cityCountry = event.country ? `${event.city}, ${event.country}` : event.city!;
        acc[cityCountry] = (acc[cityCountry] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(cityCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 6)
      .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 15) + '...' : name, count }));
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
                  <p className="text-orange-100 text-sm font-medium">Sessions</p>
                  <p className="text-2xl lg:text-3xl font-bold">{stats.uniqueSessions.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-orange-200" />
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
                <Chrome className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Top Browser</p>
                  <p className="text-lg font-bold text-gray-900 truncate">{stats.topBrowser}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <Globe2 className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Top OS</p>
                  <p className="text-lg font-bold text-gray-900 truncate">{stats.topOS}</p>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Event Types
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ChartContainer config={{}} className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getEventTypeData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {getEventTypeData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconSize={8}
                      wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Device Types
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ChartContainer config={{}} className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getDeviceData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {getDeviceData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconSize={8}
                      wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Browsers
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ChartContainer config={{}} className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getBrowserData()}
                      cx="50%"
                      cy="50%"
                      innerRadius={35}
                      outerRadius={70}
                      dataKey="value"
                    >
                      {getBrowserData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      iconSize={8}
                      wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Top Events
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ChartContainer config={{}} className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTopEvents()} layout="horizontal" margin={{ left: 5, right: 5, top: 5, bottom: 5 }}>
                    <XAxis type="number" fontSize={10} />
                    <YAxis dataKey="name" type="category" width={60} fontSize={10} />
                    <Bar dataKey="count" fill="#8B5CF6" radius={[0, 2, 2, 0]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Location Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-lg">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                Top Countries
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ChartContainer config={{}} className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTopCountries()} margin={{ left: 5, right: 5, top: 5, bottom: 60 }}>
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60} 
                      fontSize={10}
                      interval={0}
                    />
                    <YAxis fontSize={10} />
                    <Bar dataKey="count" fill="#4F46E5" radius={[2, 2, 0, 0]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-800 text-lg">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Top Cities
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ChartContainer config={{}} className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTopCities()} margin={{ left: 5, right: 5, top: 5, bottom: 60 }}>
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60} 
                      fontSize={10}
                      interval={0}
                    />
                    <YAxis fontSize={10} />
                    <Bar dataKey="count" fill="#10B981" radius={[2, 2, 0, 0]} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Events Table with Pagination and Filters */}
        <EventsTable events={events} />
      </div>
    </div>
  );
};

export default Admin;
