
import { useEffect } from "react";
import { useAppStore } from "@/store";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "lucide-react";

const Clients = () => {
  const { clients, fetchClients, loading } = useAppStore();

  useEffect(() => {
    console.log("Fetching clients...");
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    console.log("Clients loaded:", clients);
  }, [clients]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Clients</h1>

      {loading.clients ? (
        <div className="flex justify-center items-center h-40">
          <p>Loading clients...</p>
        </div>
      ) : clients.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">No clients found</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => {
            console.log("Client in loop:", client);
            return (
              <Link 
                to={`/clients/${client.uid || client.id}`} 
                key={client.id || client.uid} 
                className="block"
                onClick={() => console.log("Clicked on client:", client, "ID used for route:", client.uid || client.id)}
              >
                <Card className="hover:shadow-md transition-all duration-200 cursor-pointer">
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-3">
                      {client.avatarUrl ? (
                        <img 
                          src={client.avatarUrl} 
                          alt={client.fullName || client.name || "Client"} 
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                      )}
                      <div>
                        <CardTitle>{client.fullName || client.name || "Client"}</CardTitle>
                        <CardDescription>{client.email}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mt-2 text-sm text-gray-600">
                      {client.contactNumber && (
                        <p className="flex items-center gap-2">
                          Contact: {client.contactNumber}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Clients;
