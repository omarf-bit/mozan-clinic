import { useEffect, useState } from "react";
import { getAllLeads } from "@/lib/database";
import { Card } from "@/components/ui/card";
import {
  Users,
  Phone,
  Building2,
  TrendingUp,
  CheckCircle2,
  Calendar,
  Mail,
  Percent,
} from "lucide-react";

interface Lead {
  id: number;
  full_name: string;
  phone_number: string;
  email: string;
  institution: string;
  occupation: string;
  created_at: string;
  call_datetime?: string | null;
  call_notes?: string | null;
  visit_datetime?: string | null;
  visit_notes?: string | null;
}

interface DashboardStats {
  totalLeads: number;
  totalCalled: number;
  totalVisited: number;
  callRate: number;
  visitRate: number;
  conversionRate: number;
  todayLeads: number;
  thisWeekLeads: number;
  thisMonthLeads: number;
  occupationBreakdown: { [key: string]: number };
  dailyRegistrations: { date: string; count: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0,
    totalCalled: 0,
    totalVisited: 0,
    callRate: 0,
    visitRate: 0,
    conversionRate: 0,
    todayLeads: 0,
    thisWeekLeads: 0,
    thisMonthLeads: 0,
    occupationBreakdown: {},
    dailyRegistrations: [],
  });
  const [loading, setLoading] = useState(true);

  const calculateStats = (leads: Lead[]): DashboardStats => {
    const totalLeads = leads.length;
    const totalCalled = leads.filter((l) => l.call_datetime).length;
    const totalVisited = leads.filter((l) => l.visit_datetime).length;
    
    const callRate = totalLeads > 0 ? (totalCalled / totalLeads) * 100 : 0;
    const visitRate = totalLeads > 0 ? (totalVisited / totalLeads) * 100 : 0;
    const conversionRate = totalCalled > 0 ? (totalVisited / totalCalled) * 100 : 0;

    // Date calculations
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const monthAgo = new Date(today);
    monthAgo.setDate(monthAgo.getDate() - 30);

    const todayLeads = leads.filter(
      (l) => new Date(l.created_at) >= today
    ).length;
    const thisWeekLeads = leads.filter(
      (l) => new Date(l.created_at) >= weekAgo
    ).length;
    const thisMonthLeads = leads.filter(
      (l) => new Date(l.created_at) >= monthAgo
    ).length;

    // Occupation breakdown
    const occupationBreakdown: { [key: string]: number } = {};
    leads.forEach((lead) => {
      occupationBreakdown[lead.occupation] =
        (occupationBreakdown[lead.occupation] || 0) + 1;
    });

    // Daily registrations for last 14 days
    const dailyRegistrations: { date: string; count: number }[] = [];
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];
      const count = leads.filter((l) => {
        const leadDate = new Date(l.created_at).toISOString().split("T")[0];
        return leadDate === dateStr;
      }).length;
      dailyRegistrations.push({
        date: dateStr,
        count,
      });
    }

    return {
      totalLeads,
      totalCalled,
      totalVisited,
      callRate,
      visitRate,
      conversionRate,
      todayLeads,
      thisWeekLeads,
      thisMonthLeads,
      occupationBreakdown,
      dailyRegistrations,
    };
  };

  const loadStats = async () => {
    setLoading(true);
    try {
      const leads = await getAllLeads();
      const calculatedStats = calculateStats(leads);
      setStats(calculatedStats);
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const topOccupations = Object.entries(stats.occupationBreakdown)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const maxDailyCount = Math.max(
    ...stats.dailyRegistrations.map((d) => d.count),
    1
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Campaign Dashboard</h2>
        <p className="text-muted-foreground mt-1">
          Overview of your 25% discount campaign performance
        </p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Leads
              </p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalLeads}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Today:</span>
            <span className="font-semibold text-foreground">{stats.todayLeads}</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Leads Called
              </p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalCalled}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
              <Phone className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Call Rate:</span>
            <span className="font-semibold text-green-600">
              {stats.callRate.toFixed(1)}%
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Clinic Visits
              </p>
              <h3 className="text-3xl font-bold mt-2">{stats.totalVisited}</h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Visit Rate:</span>
            <span className="font-semibold text-purple-600">
              {stats.visitRate.toFixed(1)}%
            </span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Conversion Rate
              </p>
              <h3 className="text-3xl font-bold mt-2">
                {stats.conversionRate.toFixed(1)}%
              </h3>
            </div>
            <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            Called → Visited ratio
          </div>
        </Card>
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{stats.thisWeekLeads}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">This Month</p>
              <p className="text-2xl font-bold">{stats.thisMonthLeads}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3">
            <Percent className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-muted-foreground">Campaign Valid Until</p>
              <p className="text-lg font-bold">Dec 31, 2025</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Registrations Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Daily Registrations (Last 14 Days)
          </h3>
          <div className="space-y-2">
            {stats.dailyRegistrations.map((day, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-20">
                  {new Date(day.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <div className="flex-1 bg-muted rounded-full h-8 relative overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full flex items-center justify-end px-3 transition-all"
                    style={{
                      width: `${(day.count / maxDailyCount) * 100}%`,
                      minWidth: day.count > 0 ? "30px" : "0",
                    }}
                  >
                    {day.count > 0 && (
                      <span className="text-xs font-semibold text-white">
                        {day.count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Occupations */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Top 5 Occupations
          </h3>
          <div className="space-y-4">
            {topOccupations.length > 0 ? (
              topOccupations.map(([occupation, count], index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">{occupation}</span>
                    <span className="text-sm text-muted-foreground">
                      {count} ({((count / stats.totalLeads) * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all"
                      style={{
                        width: `${(count / stats.totalLeads) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No data available yet
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Engagement Metrics */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          Engagement Funnel
        </h3>
        <div className="space-y-4">
          {/* Total Leads */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">1. Registered Leads</span>
              <span className="text-sm font-semibold">{stats.totalLeads}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-blue-500 h-3 rounded-full transition-all"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* Called */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">2. Called</span>
              <span className="text-sm font-semibold">
                {stats.totalCalled} ({stats.callRate.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${stats.callRate}%` }}
              />
            </div>
          </div>

          {/* Visited */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">3. Visited Clinic</span>
              <span className="text-sm font-semibold">
                {stats.totalVisited} ({stats.visitRate.toFixed(1)}%)
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div
                className="bg-purple-500 h-3 rounded-full transition-all"
                style={{ width: `${stats.visitRate}%` }}
              />
            </div>
          </div>
        </div>

        {/* Key Insights */}
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">📊 Key Insights</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            <li>
              • <span className="font-medium text-foreground">{stats.totalLeads - stats.totalCalled}</span> leads not yet contacted
            </li>
            <li>
              • <span className="font-medium text-foreground">{stats.totalCalled - stats.totalVisited}</span> called leads haven't visited yet
            </li>
            <li>
              • Average conversion from call to visit:{" "}
              <span className="font-medium text-foreground">
                {stats.conversionRate.toFixed(1)}%
              </span>
            </li>
          </ul>
        </div>
      </Card>
    </div>
  );
}
