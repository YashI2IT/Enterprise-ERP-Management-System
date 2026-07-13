import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function StudentFees() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  const [paymentData, setPaymentData] = useState({
    amount: '',
    paymentMethod: 'CASH',
    referenceNumber: '',
    remarks: '',
  });

  const { data: invoices, isLoading } = useQuery({
    queryKey: ['fee-invoices'],
    queryFn: async () => {
      const res = await api.get('/fees/invoices');
      return res.data.data;
    },
  });

  const paymentMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post(`/fees/payments/${selectedInvoice._id}`, data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Payment recorded successfully');
      setSelectedInvoice(null);
      queryClient.invalidateQueries({ queryKey: ['fee-invoices'] });
      setPaymentData({ amount: '', paymentMethod: 'CASH', referenceNumber: '', remarks: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    },
  });

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    paymentMutation.mutate({
      ...paymentData,
      amount: Number(paymentData.amount),
    });
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'PAID': return <Badge className="bg-green-600">Paid</Badge>;
      case 'PARTIAL': return <Badge className="bg-yellow-600">Partial</Badge>;
      case 'OVERDUE': return <Badge variant="destructive">Overdue</Badge>;
      default: return <Badge variant="secondary">Pending</Badge>;
    }
  };

  // Very basic client-side filtering for demonstration
  const filteredInvoices = invoices?.filter((inv: any) => 
    inv.student?.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.student?.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inv.student?.admissionNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Student Fees Collection</h1>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Invoices</CardTitle>
            <Input 
              placeholder="Search student name or admission no..." 
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
              className="max-w-xs"
            />
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading invoices...</p>
          ) : filteredInvoices.length === 0 ? (
            <p className="text-muted-foreground">No invoices found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Fee Type</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((inv: any) => (
                  <TableRow key={inv._id}>
                    <TableCell>
                      <div className="font-medium">{inv.student.user?.firstName} {inv.student.user?.lastName}</div>
                      <div className="text-xs text-muted-foreground">{inv.student.admissionNumber}</div>
                    </TableCell>
                    <TableCell>{inv.student.currentGrade} - {inv.student.section}</TableCell>
                    <TableCell>{inv.feeStructure.name}</TableCell>
                    <TableCell>{new Date(inv.dueDate).toLocaleDateString()}</TableCell>
                    <TableCell>₹{inv.amountDue.toLocaleString()}</TableCell>
                    <TableCell className="font-semibold text-red-600">
                      ₹{(inv.amountDue - inv.amountPaid).toLocaleString()}
                    </TableCell>
                    <TableCell>{getStatusBadge(inv.status)}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="outline"
                        disabled={inv.status === 'PAID'}
                        onClick={() => setSelectedInvoice(inv)}
                      >
                        {inv.status === 'PAID' ? 'Settled' : 'Pay'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedInvoice} onOpenChange={(open: boolean) => !open && setSelectedInvoice(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <form onSubmit={handlePayment} className="space-y-4 pt-4">
              <div className="p-3 bg-secondary rounded-md text-sm mb-4">
                <p><strong>Student:</strong> {selectedInvoice.student.user?.firstName} {selectedInvoice.student.user?.lastName}</p>
                <p><strong>Fee:</strong> {selectedInvoice.feeStructure.name}</p>
                <p><strong>Balance Due:</strong> ₹{(selectedInvoice.amountDue - selectedInvoice.amountPaid).toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <Label>Payment Amount (₹)</Label>
                <Input 
                  type="number" 
                  min="1"
                  max={selectedInvoice.amountDue - selectedInvoice.amountPaid}
                  value={paymentData.amount}
                  onChange={(e: any) => setPaymentData({...paymentData, amount: e.target.value})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select 
                  value={paymentData.paymentMethod} 
                  onValueChange={(val: any) => setPaymentData({...paymentData, paymentMethod: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="ONLINE">Online / UPI</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                    <SelectItem value="TRANSFER">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Reference No. (Optional)</Label>
                <Input 
                  placeholder="Cheque no. or Transaction ID" 
                  value={paymentData.referenceNumber}
                  onChange={(e: any) => setPaymentData({...paymentData, referenceNumber: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Remarks (Optional)</Label>
                <Input 
                  value={paymentData.remarks}
                  onChange={(e: any) => setPaymentData({...paymentData, remarks: e.target.value})}
                />
              </div>

              <Button type="submit" className="w-full" disabled={paymentMutation.isPending}>
                {paymentMutation.isPending ? 'Processing...' : 'Confirm Payment'}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
