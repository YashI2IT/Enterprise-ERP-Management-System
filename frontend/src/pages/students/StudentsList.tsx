import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, MoreHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const fetchStudents = async (page = 1, limit = 10) => {
  const { data } = await api.get(`/students?page=${page}&limit=${limit}`);
  return data;
};

const StudentsList = () => {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useQuery({
    queryKey: ['students', page],
    queryFn: () => fetchStudents(page),
  });

  if (error) {
    return <div className="text-destructive">Error loading students</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Students</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Add Student
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-medium">All Students</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              className="pl-8"
              value={searchTerm}
              onChange={(e: any) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Admission No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Grade & Section</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Guardian Contact</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      Loading students...
                    </TableCell>
                  </TableRow>
                ) : data?.data?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10">
                      No students found.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.data?.map((student: any) => (
                    <TableRow key={student._id}>
                      <TableCell className="font-medium">{student.admissionNumber}</TableCell>
                      <TableCell>{student.user?.firstName} {student.user?.lastName}</TableCell>
                      <TableCell>{student.currentGrade} - {student.section}</TableCell>
                      <TableCell>{student.gender}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {student.guardianDetails?.name}
                          <br />
                          <span className="text-muted-foreground">
                            {student.guardianDetails?.phone}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(student.admissionNumber)}>
                              Copy Admission No
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>View details</DropdownMenuItem>
                            <DropdownMenuItem>Edit student</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((old) => Math.max(old - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {page} of {data?.pages || 1}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((old) => (!data || old === data.pages ? old : old + 1))}
              disabled={!data || page === data.pages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentsList;
