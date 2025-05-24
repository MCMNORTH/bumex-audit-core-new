
import { useAppStore } from "@/store";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { IssueCard } from "@/components/IssueCard";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ProjectIssues = () => {
  const { projectId = "" } = useParams();
  const { getIssuesByProject, getEpicsByProject, fetchIssues, loading } = useAppStore();
  
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<string>("all");

  // Add useEffect hook to fetch issues when component mounts
  useEffect(() => {
    if (projectId) {
      console.log("ProjectIssues: Fetching issues for project", projectId);
      fetchIssues(projectId);
    }
  }, [projectId, fetchIssues]);

  const issues = getIssuesByProject(projectId);
  const epics = getEpicsByProject(projectId);
  
  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(search.toLowerCase());
    if (filter === "all") return matchesSearch;
    if (filter === "unassigned") return matchesSearch && !issue.assignee;
    if (filter.startsWith("type-")) return matchesSearch && issue.type === filter.replace("type-", "");
    if (filter.startsWith("epic-")) return matchesSearch && issue.epicId === filter.replace("epic-", "");
    return matchesSearch;
  });

  return (
    <div className="h-full flex flex-col">
      <ProjectHeader projectId={projectId} />
      <div className="p-4">
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search issues..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-64">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter issues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Issues</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                <SelectItem value="type-task">Tasks</SelectItem>
                <SelectItem value="type-bug">Bugs</SelectItem>
                <SelectItem value="type-story">Stories</SelectItem>
                <SelectItem value="type-epic">Epics</SelectItem>
                {epics.map(epic => (
                  <SelectItem key={epic.id} value={`epic-${epic.id}`}>
                    Epic: {epic.title.substring(0, 20)}...
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading.issues ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Loading issues...</p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {filteredIssues.map(issue => (
              <div key={issue.id} className="bg-white rounded-md shadow p-1">
                <IssueCard issue={issue} />
              </div>
            ))}
            
            {filteredIssues.length === 0 && !loading.issues && (
              <div className="col-span-full py-8 text-center">
                <p className="text-gray-500">No issues match your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectIssues;
