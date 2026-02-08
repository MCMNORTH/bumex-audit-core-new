
import { useEffect, useState } from "react";
import { User as UserType, Project } from "@/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User, Building } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Users = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const usersCollection = collection(db, "users");
        // Filter users to only show clients
        const q = query(usersCollection, where("userType", "==", "client"));
        const usersSnap = await getDocs(q);
        const usersData = usersSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as UserType[];
        
        setUsers(usersData);
        console.log("Fetched client users:", usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load users. Please try again later.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUserClick = (userId: string) => {
    navigate(`/users/${userId}`);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Clients</h1>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading clients...</p>
        </div>
      ) : users.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">No clients found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => (
            <Card 
              key={user.id} 
              className="hover:shadow-md transition-all duration-200 cursor-pointer" 
              onClick={() => handleUserClick(user.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.fullName || user.name || user.email} 
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-6 w-6 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <CardTitle>{user.fullName || user.name || user.email}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mt-2 text-sm text-gray-600">
                  {user.contactNumber && (
                    <p className="flex items-center gap-2 mb-1">
                      Contact: {user.contactNumber}
                    </p>
                  )}
                  <p className="flex items-center gap-2 mb-1">
                    Role: Client
                  </p>
                  {user.company && (
                    <p className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      {user.company}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;
