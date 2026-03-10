"use client";

import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { mockStore, User } from "@/lib/store";
import { Search, Ban, Unlock, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function UsersManagementPage() {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await mockStore.getUsers();
        setUsersList(users);
      } catch (error) {
        console.error("Failed to fetch users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Check Firestore permissions.",
          variant: "destructive"
        });
      }
    };
    
    fetchUsers();
  }, [toast]);

  const filteredUsers = usersList.filter(u => 
    u.role !== "Admin" &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleBlockStatus = async (user: User) => {
    const updatedUser = { ...user, isBlocked: !user.isBlocked };
    await mockStore.saveUser(updatedUser);
    
    // Refresh local state
    const updatedList = usersList.map(u => u.id === user.id ? updatedUser : u);
    setUsersList(updatedList);

    toast({
      title: user.isBlocked ? "User Unblocked" : "User Blocked",
      description: `${user.name} access has been updated.`,
      variant: user.isBlocked ? "default" : "destructive"
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border flex items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Find user by name or email..." 
              className="pl-10 h-11"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="text-sm text-muted-foreground hidden sm:block">
            Found {filteredUsers.length} total users
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>User Information</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className={user.isBlocked ? "opacity-60 grayscale bg-muted/10" : "hover:bg-muted/5"}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-sidebar" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">{user.name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-white">
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {user.collegeOrOffice || "Profile Incomplete"}
                  </TableCell>
                  <TableCell>
                    {user.isBlocked ? (
                      <Badge variant="destructive" className="animate-pulse">Blocked</Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant={user.isBlocked ? "outline" : "destructive"} 
                      size="sm"
                      onClick={() => toggleBlockStatus(user)}
                      className="transition-all duration-300"
                    >
                      {user.isBlocked ? (
                        <>
                          <Unlock className="w-4 h-4 mr-2" />
                          Unblock
                        </>
                      ) : (
                        <>
                          <Ban className="w-4 h-4 mr-2" />
                          Block
                        </>
                      )}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}