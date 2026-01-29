'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, PoundSterling, Search, Eye, TrendingUp, Bell, ArrowRight, Leaf } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface QuickStat {
  label: string;
  value: string | number;
  change?: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface RecentActivity {
  id: string;
  action: string;
  details: any;
  timestamp: Date;
}

interface RecentSearch {
  id: string;
  query: string;
  timestamp: Date;
  results_count: number;
}

// Mock data - replace with actual API calls
async function getDashboardData() {
  return {
    stats: {
      timeSaved: 24,
      moneySaved: 1250,
      totalSearches: 127,
      carbonSaved: 450,
    },
    recentSearches: [
      { id: '1', query: 'cement 50kg', timestamp: new Date(), results_count: 15 },
      { id: '2', query: 'insulation rolls', timestamp: new Date(Date.now() - 3600000), results_count: 8 },
      { id: '3', query: 'eco-friendly lumber', timestamp: new Date(Date.now() - 7200000), results_count: 23 },
    ],
    recentActivity: [
      { id: '1', action: 'search', details: { query: 'cement' }, timestamp: new Date() },
      { id: '2', action: 'view_product', details: { product_name: 'Recycled Insulation' }, timestamp: new Date(Date.now() - 1800000) },
      { id: '3', action: 'eco_choice', details: { product_name: 'Sustainable Timber' }, timestamp: new Date(Date.now() - 3600000) },
    ],
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    getDashboardData().then(data => {
      setDashboardData(data);
      setIsLoading(false);
    });
  }, []);

  if (!mounted || isLoading) {
    return <DashboardSkeleton />;
  }

  const data = dashboardData!;

  const stats: QuickStat[] = [
    {
      label: 'Time Saved',
      value: `${data.stats.timeSaved}h`,
      change: '+12%',
      description: 'By checking stock before visiting stores',
      icon: Clock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Money Saved',
      value: `£${data.stats.moneySaved.toLocaleString()}`,
      change: '+8%',
      description: 'Through price comparison',
      icon: PoundSterling,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Total Searches',
      value: data.stats.totalSearches,
      change: '+24',
      description: 'Product searches performed',
      icon: Search,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Carbon Impact',
      value: `${data.stats.carbonSaved}kg`,
      change: '-15%',
      description: 'CO2 saved through eco-choices',
      icon: Leaf,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  const formatActivity = (activity: RecentActivity) => {
    const actionMap: Record<string, string> = {
      search: `Searched for "${activity.details.query}"`,
      view_product: `Viewed "${activity.details.product_name}"`,
      eco_choice: `Chose eco-friendly "${activity.details.product_name}"`,
    };

    return actionMap[activity.action] || activity.action;
  };

  const getActivityIcon = (action: string) => {
    const icons: Record<string, any> = {
      search: Search,
      view_product: Eye,
      eco_choice: Leaf,
    };

    return icons[action] || Bell;
  };

  const runSearch = (query: string) => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Your Dashboard
          </h1>
          <p className="text-muted-foreground text-lg">
            Track your sustainable building journey
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.description}
                  </p>
                  {stat.change && (
                    <Badge variant="secondary" className="mt-2">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      {stat.change}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">
            {/* Recent Searches */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Recent Searches</CardTitle>
                  <Link href="/search">
                    <Button variant="ghost" size="sm">
                      New Search
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.recentSearches.map((search: RecentSearch) => (
                    <button
                      key={search.id}
                      onClick={() => runSearch(search.query)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors text-left"
                    >
                      <div className="flex items-center gap-3">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{search.query}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{search.results_count} results</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {data.recentActivity.map((activity: RecentActivity) => {
                    const Icon = getActivityIcon(activity.action);
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                      >
                        <div className="p-2 rounded-full bg-primary/10">
                          <Icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm">{formatActivity(activity)}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/search" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Search className="mr-2 h-4 w-4" />
                    New Search
                  </Button>
                </Link>
                <Link href="/profile" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Eye className="mr-2 h-4 w-4" />
                    My Profile
                  </Button>
                </Link>
                <Link href="/profile/orders" className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Bell className="mr-2 h-4 w-4" />
                    My Orders
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Eco Tip */}
            <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-800">
                  <Leaf className="h-5 w-5" />
                  Eco Tip
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-emerald-900">
                  Choosing materials with A-rated eco-certifications can reduce your project&apos;s carbon footprint by up to 30%.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-10 w-10 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-14 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
