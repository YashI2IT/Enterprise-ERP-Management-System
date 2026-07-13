import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Users, Receipt, AlertCircle } from 'lucide-react';

export default function FeesDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['fee-dashboard-stats'],
    queryFn: async () => {
      // For now, we fetch invoices and manually calculate the stats here.
      // In a real production scenario with huge data, this should be an aggregation query in the backend.
      const res = await api.get('/fees/invoices');
      const invoices = res.data.data;
      
      let totalDue = 0;
      let totalCollected = 0;
      let pendingInvoices = 0;
      
      invoices.forEach((inv: any) => {
        totalDue += inv.amountDue;
        totalCollected += inv.amountPaid;
        if (inv.status === 'PENDING' || inv.status === 'PARTIAL' || inv.status === 'OVERDUE') {
          pendingInvoices++;
        }
      });

      return {
        totalDue,
        totalCollected,
        pendingInvoices,
        totalInvoices: invoices.length,
        outstanding: totalDue - totalCollected,
      };
    },
  });

  if (isLoading) return <div className="p-6">Loading dashboard data...</div>;

  const stats = data || {
    totalDue: 0,
    totalCollected: 0,
    pendingInvoices: 0,
    totalInvoices: 0,
    outstanding: 0,
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Finance & Fees Overview</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expected (All Time)</CardTitle>
            <IndianRupee className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalDue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Generated via structures</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{stats.totalCollected.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Successful payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Dues</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">₹{stats.outstanding.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Needs to be collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">Out of {stats.totalInvoices} total</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Detailed charts and recent transaction logs will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
