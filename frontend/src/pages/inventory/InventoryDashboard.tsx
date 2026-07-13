import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Archive, AlertTriangle, CheckCircle2, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function InventoryDashboard() {
  const { data: items, isLoading } = useQuery({
    queryKey: ['inventory-items'],
    queryFn: async () => {
      const res = await api.get('/inventory/items');
      return res.data.data;
    },
  });

  if (isLoading) return <div className="p-6">Loading inventory data...</div>;

  const totalItems = items?.length || 0;
  const totalStock = items?.reduce((acc: number, item: any) => acc + item.quantity, 0) || 0;
  const lowStockItems = items?.filter((item: any) => item.quantity <= item.minThreshold) || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Inventory Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Unique Items</CardTitle>
            <Archive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock Quantity</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStock} units</div>
          </CardContent>
        </Card>
        <Card className={lowStockItems.length > 0 ? "border-red-200 bg-red-50/30" : "border-green-200 bg-green-50/30"}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Items Needing Restock</CardTitle>
            {lowStockItems.length > 0 ? (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${lowStockItems.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {lowStockItems.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" /> Low Stock Alerts
            </CardTitle>
            <CardDescription>Items at or below their minimum threshold</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">All items are sufficiently stocked.</p>
            ) : (
              <ul className="space-y-4">
                {lowStockItems.map((item: any) => (
                  <li key={item._id} className="flex justify-between items-center bg-red-50 p-3 rounded border border-red-100">
                    <div>
                      <p className="font-semibold text-red-900">{item.itemName}</p>
                      <p className="text-xs text-red-700">Location: {item.location}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="destructive">{item.quantity} {item.unit} left</Badge>
                      <p className="text-[10px] text-red-600 mt-1">Min threshold: {item.minThreshold}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Inventory</CardTitle>
            <CardDescription>Quick view of your catalog</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.slice(0, 5).map((item: any) => (
                  <TableRow key={item._id}>
                    <TableCell className="font-medium">{item.itemName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {item.quantity} <span className="text-xs text-muted-foreground font-normal">{item.unit}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">Go to Manage Items for the full catalog.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
