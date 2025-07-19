<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\ScrumboardProject;
use App\Models\ScrumboardTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ScrumboardController extends Controller
{
    /**
     * Get all projects with tasks
     */
    public function index()
    {
        try {
            $projects = ScrumboardProject::with('tasks')->orderBy('order')->get();
            
            return response()->json([
                'success' => true,
                'data' => $projects
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error fetching scrumboard data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new project
     */
    public function storeProject(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'color' => 'nullable|string|max:7',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $maxOrder = ScrumboardProject::max('order') ?? 0;
            
            $project = ScrumboardProject::create([
                'title' => $request->title,
                'color' => $request->color ?? '#3b82f6',
                'order' => $maxOrder + 1
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Project created successfully',
                'data' => $project
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating project: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a project
     */
    public function updateProject(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'color' => 'nullable|string|max:7',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $project = ScrumboardProject::findOrFail($id);
            $project->update([
                'title' => $request->title,
                'color' => $request->color ?? $project->color,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Project updated successfully',
                'data' => $project
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating project: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a project
     */
    public function destroyProject($id)
    {
        try {
            $project = ScrumboardProject::findOrFail($id);
            $project->delete();

            return response()->json([
                'success' => true,
                'message' => 'Project deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting project: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a new task
     */
    public function storeTask(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'project_id' => 'required|exists:scrumboard_projects,id',
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'tags' => 'nullable|string',
                'priority' => 'nullable|in:high,medium,low',
                'assignee' => 'nullable|string|max:255',
                'progress' => 'nullable|integer|min:0|max:100',
                'due_date' => 'nullable|date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $maxOrder = ScrumboardTask::where('project_id', $request->project_id)->max('order') ?? 0;
            
            $task = ScrumboardTask::create([
                'project_id' => $request->project_id,
                'title' => $request->title,
                'description' => $request->description,
                'tags' => $request->tags ? explode(',', $request->tags) : [],
                'priority' => $request->priority ?? 'medium',
                'assignee' => $request->assignee,
                'progress' => $request->progress ?? 0,
                'due_date' => $request->due_date,
                'order' => $maxOrder + 1
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Task created successfully',
                'data' => $task
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error creating task: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a task
     */
    public function updateTask(Request $request, $id)
    {
        try {
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'nullable|string',
                'tags' => 'nullable|string',
                'priority' => 'nullable|in:high,medium,low',
                'assignee' => 'nullable|string|max:255',
                'progress' => 'nullable|integer|min:0|max:100',
                'due_date' => 'nullable|date',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            $task = ScrumboardTask::findOrFail($id);
            $task->update([
                'title' => $request->title,
                'description' => $request->description,
                'tags' => $request->tags ? explode(',', $request->tags) : [],
                'priority' => $request->priority ?? $task->priority,
                'assignee' => $request->assignee,
                'progress' => $request->progress ?? $task->progress,
                'due_date' => $request->due_date,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Task updated successfully',
                'data' => $task
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating task: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a task
     */
    public function destroyTask($id)
    {
        try {
            $task = ScrumboardTask::findOrFail($id);
            $task->delete();

            return response()->json([
                'success' => true,
                'message' => 'Task deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error deleting task: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update task order (for drag & drop)
     */
    public function updateTaskOrder(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'tasks' => 'required|array',
                'tasks.*.id' => 'required|exists:scrumboard_tasks,id',
                'tasks.*.project_id' => 'required|exists:scrumboard_projects,id',
                'tasks.*.order' => 'required|integer|min:0',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation error',
                    'errors' => $validator->errors()
                ], 422);
            }

            foreach ($request->tasks as $taskData) {
                ScrumboardTask::where('id', $taskData['id'])->update([
                    'project_id' => $taskData['project_id'],
                    'order' => $taskData['order']
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Task order updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error updating task order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Clear all tasks in a project
     */
    public function clearProjectTasks($projectId)
    {
        try {
            $project = ScrumboardProject::findOrFail($projectId);
            $project->tasks()->delete();

            return response()->json([
                'success' => true,
                'message' => 'All tasks in project cleared successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error clearing project tasks: ' . $e->getMessage()
            ], 500);
        }
    }
}
