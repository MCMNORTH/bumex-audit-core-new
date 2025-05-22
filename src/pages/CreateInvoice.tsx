
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Currency, InvoiceItem } from "@/types";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { firestore } from "@/lib/firebase";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/components/ui/use-toast";
import { PlusCircle, MinusCircle } from "lucide-react";

const invoiceFormSchema = z.object({
  userId: z.string().optional(),
  clientName: z.string().min(1, "Client name is required"),
  dueDate: z.string().min(1, "Due date is required"),
  currency: z.enum(["MRU", "USD", "EUR"]).default("MRU"),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.coerce.number().positive("Quantity must be positive"),
    price: z.coerce.number().positive("Price must be positive")
  })).min(1, "At least one item is required"),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch users from Firestore
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const fetchedUsers = await firestore.getAllUsers() as User[];
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast({
          title: "Error",
          description: "Failed to load users. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    fetchUsers();
  }, []);

  const defaultValues: Partial<InvoiceFormValues> = {
    clientName: "",
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    currency: "MRU",
    items: [{
      description: "",
      quantity: 1,
      price: 0
    }]
  };

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues
  });

  const { fields, append, remove } = form.control._fields.items || { fields: [], append: () => {}, remove: () => {} };

  // Filter users based on search term
  useEffect(() => {
    if (searchTerm) {
      const filtered = users.filter(user => 
        (user.fullName || user.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredUsers(filtered);
      setShowSuggestions(true);
    } else {
      setFilteredUsers([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, users]);

  const selectUser = (user: User) => {
    form.setValue("clientName", user.fullName || user.name || user.email);
    form.setValue("userId", user.id);
    setSearchTerm(user.fullName || user.name || user.email);
    setShowSuggestions(false);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    form.setValue("clientName", e.target.value);
  };

  const calculateTotal = () => {
    const items = form.getValues("items") || [];
    return items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const addItem = () => {
    append({ description: "", quantity: 1, price: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: InvoiceFormValues) => {
    setIsGenerating(true);
    
    try {
      const total = calculateTotal();
      
      // Create invoice document
      const invoiceData = {
        id: uuidv4(),
        userId: data.userId || "",
        clientName: data.clientName,
        items: data.items as InvoiceItem[],
        total,
        currency: data.currency as Currency,
        status: "pending" as const,
        issueDate: new Date().toISOString().split('T')[0],
        dueDate: data.dueDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await firestore.createInvoice(invoiceData);
      
      toast({
        title: "Success",
        description: "Invoice created successfully!",
      });
      
      // Redirect to the invoice list
      navigate('/invoices');
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-8">
          <img 
            src="https://storage.googleapis.com/flutterflow-io-6f20.appspot.com/projects/over-work-98o8wz/assets/2dgtj37xrkp6/Logo_wide_transparent.png" 
            alt="OVERCODE" 
            className="h-8 mr-4"
          />
          <h1 className="text-3xl font-bold">Create New Invoice</h1>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="relative">
                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Search for a client..." 
                          value={searchTerm}
                          onChange={handleSearchChange}
                          onFocus={() => setShowSuggestions(true)}
                          onBlur={() => {
                            // Delay hiding suggestions to allow click
                            setTimeout(() => setShowSuggestions(false), 200);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {showSuggestions && filteredUsers.length > 0 && (
                  <div className="absolute z-10 w-full bg-white border border-gray-200 mt-1 rounded-md max-h-60 overflow-y-auto shadow-lg">
                    {filteredUsers.map((user) => (
                      <div 
                        key={user.id} 
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => selectUser(user)}
                      >
                        <div>{user.fullName || user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <FormField
                control={form.control}
                name="currency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Currency</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="MRU">MRU - Mauritanian Ouguiya</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="EUR">EUR - Euro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">Invoice Items</h3>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    onClick={addItem}
                    className="flex items-center"
                  >
                    <PlusCircle className="h-4 w-4 mr-1" /> Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {form.watch("items")?.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-4 items-end border p-4 rounded-md bg-gray-50">
                      <div className="col-span-6">
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-2">
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Qty</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-3">
                        <FormField
                          control={form.control}
                          name={`items.${index}.price`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Price</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.01" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(index)}
                          disabled={form.watch("items")?.length <= 1}
                        >
                          <MinusCircle className="h-5 w-5 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end mt-4">
                  <div className="text-lg font-semibold">
                    Total: {form.watch("currency")} {calculateTotal().toFixed(2)}
                  </div>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/invoices')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isGenerating}
                  className="bg-jira-blue hover:bg-jira-blue-dark"
                >
                  {isGenerating ? "Generating..." : "Generate Invoice"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
