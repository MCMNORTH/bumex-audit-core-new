
import { useAppStore } from "@/store";
import { Button } from "./ui/button";
import { Issue } from "@/types";
import { useState } from "react";
import { PlusCircle, CheckSquare, X } from "lucide-react";
import { Input } from "./ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";

interface SubTaskListProps {
  parentIssue: Issue;
}

const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export const SubTaskList = ({ parentIssue }: SubTaskListProps) => {
  const { issues, addIssue, updateIssueStatus, deleteIssue } = useAppStore();
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
    },
  });

  // Filter to get all subtasks for this parent issue
  const subtasks = issues.filter(
    (issue) => issue.parentId === parentIssue.id && issue.type === "subtask"
  );

  const onAddSubtask = async (values: z.infer<typeof formSchema>) => {
    try {
      await addIssue({
        title: values.title,
        type: "subtask",
        status: "todo",
        priority: "medium",
        projectId: parentIssue.projectId,
        reporterId: parentIssue.reporterId,
        parentId: parentIssue.id,
        sprintId: parentIssue.sprintId,
      });

      form.reset();
      setIsAddingSubtask(false);
      toast("Subtask added", {
        description: "The subtask has been added successfully",
      });
    } catch (error) {
      console.error("Error adding subtask:", error);
      toast("Failed to add subtask", {
        description: "An error occurred while adding the subtask",
      });
    }
  };

  const toggleSubtaskStatus = async (subtask: Issue) => {
    const newStatus = subtask.status === "done" ? "todo" : "done";
    try {
      await updateIssueStatus(subtask.id, newStatus);
      toast("Subtask updated", {
        description: `Subtask marked as ${newStatus === "done" ? "completed" : "to do"}`
      });
    } catch (error) {
      console.error("Error updating subtask:", error);
      toast("Failed to update subtask", {
        description: "An error occurred while updating the subtask status"
      });
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    try {
      await deleteIssue(subtaskId);
      toast("Subtask deleted", {
        description: "The subtask has been deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting subtask:", error);
      toast("Failed to delete subtask", {
        description: "An error occurred while deleting the subtask"
      });
    }
  };

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Subtasks</h3>
        <span className="text-sm text-gray-500">
          {subtasks.filter(st => st.status === "done").length}/{subtasks.length} completed
        </span>
      </div>

      <div className="space-y-3">
        {subtasks.map((subtask) => (
          <div
            key={subtask.id}
            className="flex items-center p-3 bg-gray-50 rounded-md border border-gray-200"
          >
            <button
              className="flex-shrink-0 mr-3"
              onClick={() => toggleSubtaskStatus(subtask)}
            >
              <CheckSquare
                className={`h-5 w-5 ${
                  subtask.status === "done"
                    ? "text-[#459ed7] fill-[#459ed7]"
                    : "text-gray-300"
                }`}
              />
            </button>
            <span
              className={`flex-grow ${
                subtask.status === "done" ? "line-through text-gray-500" : ""
              }`}
            >
              {subtask.title}
            </span>
            <button
              onClick={() => handleDeleteSubtask(subtask.id)}
              className="flex-shrink-0 text-gray-400 hover:text-[#f04f3a]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}

        {subtasks.length === 0 && !isAddingSubtask && (
          <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-md">
            No subtasks yet
          </div>
        )}

        {isAddingSubtask ? (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onAddSubtask)}
              className="bg-gray-50 p-3 rounded-md border border-gray-200"
            >
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        placeholder="Enter subtask title"
                        {...field}
                        autoFocus
                        className="mb-2"
                      />
                    </FormControl>
                    <FormMessage className="text-[#f04f3a]" />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsAddingSubtask(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="bg-[#459ed7] hover:bg-[#3688bd]">
                  Add
                </Button>
              </div>
            </form>
          </Form>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAddingSubtask(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Subtask
          </Button>
        )}
      </div>
    </div>
  );
};
