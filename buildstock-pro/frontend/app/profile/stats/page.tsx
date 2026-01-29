'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye, Star, TrendingUp, Award, Target, Calendar, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface StatCard {
  label: string;
  value: string | number;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
}

// Mock data - replace with actual API calls
async function getUserStats() {
  return {
    stats: {
      totalSearches: 127,
      productsViewed: 384,
      ratingsGiven: 23,
      ecoChoices: 45,
      favoriteCategory: 'Insulation',
      averageRating: 4.2,
    },
    achievements: [
      {
        id: '1',
        title: 'First Search',
        description: 'Completed your first product search',
        icon: '🔍',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: '2',
        title: 'Eco Warrior',
        description: 'Made 25+ eco-friendly choices',
        icon: '🌿',
        unlocked: true,
        unlockedAt: new Date(),
      },
      {
        id: '3',
        title: 'Reviewer',
        description: 'Rated 20+ products',
        icon: '⭐',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: '4',
        title: 'Saver',
        description: 'Saved £1000+ through comparisons',
        icon: '💰',
        unlocked: true,
        unlockedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        id: '5',
        title: 'Expert',
        description: 'Viewed 500+ products',
        icon: '🎯',
        unlocked: false,
      },
      {
        id: '6',
        title: 'Influencer',
        description: 'Written 50+ reviews',
        icon: '✍️',
        unlocked: false,
      },
    ],
    recentActivity: [
      { id: '1', type: 'search', details: 'Searched for "cement"', timestamp: new Date() },
      { id: '2', type: 'rating', details: 'Rated "Recycled Insulation"', timestamp: new Date(Date.now() - 1800000) },
      { id: '3', type: 'view', details: 'Viewed "Sustainable Timber"', timestamp: new Date(Date.now() - 3600000) },
    ],
  };
}

export default function ProfileStatsPage() {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    getUserStats().then(data => {
      setStatsData(data);
      setIsLoading(false);
    });
  }, []);

  if (!mounted || isLoading) {
    return <StatsSkeleton />;
  }

  const data = statsData!;

  const statCards: StatCard[] = [
    {
      label: 'Total Searches',
      value: data.stats.totalSearches,
      description: 'Products you&apos;ve searched for',
      icon: Search,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Products Viewed',
      value: data.stats.productsViewed,
      description: 'Product pages viewed',
      icon: Eye,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      label: 'Ratings Given',
      value: data.stats.ratingsGiven,
      description: 'Products you&apos;ve rated',
      icon: Star,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Eco Choices',
      value: data.stats.ecoChoices,
      description: 'Sustainable products chosen',
      icon: Award,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header with back navigation */}
        <div className="mb-8">
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="mb-4">
              ← Back to Profile
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight">
              Your Statistics
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Track your building materials journey
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map((stat) => {
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
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Favorite Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">
                {data.stats.favoriteCategory}
              </div>
              <p className="text-sm text-muted-foreground">
                Most searched category
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Average Rating Given
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="text-3xl font-bold text-yellow-600">
                  {data.stats.averageRating}
                </div>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${
                        i < Math.floor(data.stats.averageRating)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Across {data.stats.ratingsGiven} ratings
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.achievements.map((achievement: Achievement) => (
                  <div
                    key={achievement.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      achievement.unlocked
                        ? 'bg-primary/5 border-primary/20'
                        : 'bg-muted/30 border-muted opacity-60'
                    }`}
                  >
                    <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                      {achievement.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{achievement.title}</h4>
                        {achievement.unlocked && (
                          <Badge variant="default" className="text-xs">
                            Unlocked
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      {achievement.unlockedAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          <Calendar className="h-3 w-3 inline mr-1" />
                          {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {data.recentActivity.map((activity: any) => {
                  const Icon = activity.type === 'search' ? Search :
                               activity.type === 'rating' ? Star : Eye;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="p-2 rounded-full bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.details}</p>
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

        {/* Call to Action */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">
                  Keep exploring sustainable materials
                </h3>
                <p className="text-sm text-muted-foreground">
                  Discover more eco-friendly options for your next project
                </p>
              </div>
              <Link href="/search">
                <Button>
                  <Search className="mr-2 h-4 w-4" />
                  Search Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatsSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-4" />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-10 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-8 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
