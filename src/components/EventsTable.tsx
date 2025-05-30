
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from '@/components/ui/pagination';
import { Smartphone, Laptop, Tablet, Monitor, Filter, Search, Calendar } from 'lucide-react';
import type { Database } from '@/integrations/supabase/types';

type AnalyticsEvent = Database['public']['Tables']['analytics_events']['Row'];

interface EventsTableProps {
  events: AnalyticsEvent[];
}

const EventsTable: React.FC<EventsTableProps> = ({ events }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [searchTerm, setSearchTerm] = useState('');
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [browserFilter, setBrowserFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Get unique values for filters
  const uniqueCountries = useMemo(() => {
    const countries = events.filter(e => e.country).map(e => e.country!);
    return [...new Set(countries)].sort();
  }, [events]);

  const uniqueBrowsers = useMemo(() => {
    const browsers = events.filter(e => e.browser).map(e => e.browser!);
    return [...new Set(browsers)].sort();
  }, [events]);

  const uniqueDevices = useMemo(() => {
    const devices = events.filter(e => e.channel).map(e => e.channel!);
    return [...new Set(devices)].sort();
  }, [events]);

  // Filter events based on current filters
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      const matchesSearch = event.event_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.page_url.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesEventType = eventTypeFilter === 'all' || event.event_type === eventTypeFilter;
      const matchesDevice = deviceFilter === 'all' || event.channel === deviceFilter;
      const matchesCountry = countryFilter === 'all' || event.country === countryFilter;
      const matchesBrowser = browserFilter === 'all' || event.browser === browserFilter;
      
      let matchesDate = true;
      if (dateFilter !== 'all') {
        const eventDate = new Date(event.created_at);
        const now = new Date();
        
        switch (dateFilter) {
          case 'today':
            matchesDate = eventDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = eventDate >= weekAgo;
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = eventDate >= monthAgo;
            break;
        }
      }
      
      return matchesSearch && matchesEventType && matchesDevice && matchesCountry && matchesBrowser && matchesDate;
    });
  }, [events, searchTerm, eventTypeFilter, deviceFilter, countryFilter, browserFilter, dateFilter]);

  // Paginate filtered events
  const totalPages = Math.ceil(filteredEvents.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + pageSize);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, eventTypeFilter, deviceFilter, countryFilter, browserFilter, dateFilter]);

  const getDeviceIcon = (channel: string) => {
    switch (channel) {
      case 'Desktop': return <Laptop className="h-4 w-4" />;
      case 'Mobile': return <Smartphone className="h-4 w-4" />;
      case 'Tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setEventTypeFilter('all');
    setDeviceFilter('all');
    setCountryFilter('all');
    setBrowserFilter('all');
    setDateFilter('all');
    setCurrentPage(1);
  };

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Events Table
          </div>
          <div className="text-sm font-normal text-gray-500">
            {filteredEvents.length} of {events.length} events
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2 min-w-[200px]">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search events or URLs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9"
              />
            </div>
            
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="page_view">Page View</SelectItem>
                <SelectItem value="click">Click</SelectItem>
                <SelectItem value="download">Download</SelectItem>
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-[120px] h-9">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">Last 7 days</SelectItem>
                <SelectItem value="month">Last 30 days</SelectItem>
              </SelectContent>
            </Select>

            {uniqueDevices.length > 0 && (
              <Select value={deviceFilter} onValueChange={setDeviceFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Device" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Devices</SelectItem>
                  {uniqueDevices.map(device => (
                    <SelectItem key={device} value={device}>{device}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {uniqueBrowsers.length > 0 && (
              <Select value={browserFilter} onValueChange={setBrowserFilter}>
                <SelectTrigger className="w-[120px] h-9">
                  <SelectValue placeholder="Browser" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Browsers</SelectItem>
                  {uniqueBrowsers.map(browser => (
                    <SelectItem key={browser} value={browser}>{browser}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {uniqueCountries.length > 0 && (
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder="Country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  {uniqueCountries.map(country => (
                    <SelectItem key={country} value={country}>{country}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button variant="outline" size="sm" onClick={clearFilters} className="h-9">
              <Filter className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Show:</span>
            <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
              <SelectTrigger className="w-[100px] h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-gray-600">entries per page</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[120px]">Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Event</TableHead>
                <TableHead>Device</TableHead>
                <TableHead className="hidden md:table-cell">Browser</TableHead>
                <TableHead className="hidden lg:table-cell">OS</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden xl:table-cell">Resolution</TableHead>
                <TableHead className="hidden lg:table-cell">Page URL</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEvents.map((event) => (
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
                  <TableCell className="text-sm text-gray-600 hidden md:table-cell">
                    {event.browser || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 hidden lg:table-cell">
                    {event.operating_system || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 hidden md:table-cell max-w-[150px] truncate">
                    {event.city && event.country ? `${event.city}, ${event.country}` : 
                     event.country ? event.country : 'Unknown'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 hidden xl:table-cell">
                    {event.screen_resolution || 'Unknown'}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 hidden lg:table-cell max-w-[200px] truncate">
                    {event.page_url}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(startIndex + pageSize, filteredEvents.length)} of {filteredEvents.length} results
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        onClick={() => setCurrentPage(pageNum)}
                        isActive={currentPage === pageNum}
                        className="cursor-pointer"
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventsTable;
