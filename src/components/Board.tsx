
import { Status } from "@/types";
import { IssueCard } from "./IssueCard";
import { useAppStore } from "@/store";
import { cn } from "@/lib/utils";

interface BoardProps {
  projectId: string;
}

const columns: { id: Status; title: string }[] = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "in-review", title: "In Review" },
  { id: "done", title: "Done" },
];

export const Board = ({ projectId }: BoardProps) => {
  const { getIssuesByProject } = useAppStore();
  const issues = getIssuesByProject(projectId);

  const issuesByStatus = (status: Status) => {
    return issues.filter((issue) => issue.status === status);
  };

  return (
    <div className="p-4 flex gap-4 overflow-x-auto">
      {columns.map((column) => (
        <div key={column.id} className="kanban-column">
          <h3 className="font-medium mb-3 flex items-center justify-between">
            {column.title}
            <span className="bg-gray-200 text-gray-600 text-xs font-medium px-2 py-0.5 rounded-full">
              {issuesByStatus(column.id).length}
            </span>
          </h3>
          <div className="space-y-2">
            {issuesByStatus(column.id).map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
