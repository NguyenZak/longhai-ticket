'use client';
import Dropdown from '@/components/dropdown';
import IconCalendar from '@/components/icon/icon-calendar';
import IconEdit from '@/components/icon/icon-edit';
import IconHorizontalDots from '@/components/icon/icon-horizontal-dots';
import IconPlus from '@/components/icon/icon-plus';
import IconPlusCircle from '@/components/icon/icon-plus-circle';
import IconTag from '@/components/icon/icon-tag';
import IconTrashLines from '@/components/icon/icon-trash-lines';
import IconX from '@/components/icon/icon-x';
import { IRootState } from '@/store';
import { scrumboardAPI } from '@/lib/api';
import { Transition, Dialog, DialogPanel, TransitionChild } from '@headlessui/react';
import React, { Fragment, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ReactSortable } from 'react-sortablejs';
import Swal from 'sweetalert2';

const ComponentsAppsScrumBoard = () => {
    const [projectList, setProjectList] = useState<any>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    
    const [params, setParams] = useState<any>({
        id: null,
        title: '',
        color: '#3b82f6',
    });
    
    const [paramsTask, setParamsTask] = useState<any>({
        projectId: null,
        id: null,
        title: '',
        description: '',
        tags: '',
        date: '',
        priority: 'medium',
        assignee: '',
    });

    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isAddProjectModal, setIsAddProjectModal] = useState(false);
    const [isAddTaskModal, setIsAddTaskModal] = useState(false);
    const [isDeleteModal, setIsDeleteModal] = useState(false);

    // Load data from API on component mount
    useEffect(() => {
        loadScrumboardData();
    }, []);

    const loadScrumboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await scrumboardAPI.getAll();
            
            if (response.success) {
                // Transform data to match frontend format
                const transformedData = response.data.map((project: any) => ({
                    id: project.id,
                    title: project.title,
                    color: project.color,
                    tasks: project.tasks.map((task: any) => ({
                        projectId: task.project_id,
                        id: task.id,
                        title: task.title,
                        description: task.description,
                        tags: task.tags || [],
                        priority: task.priority,
                        assignee: task.assignee,
                        progress: task.progress,
                        date: task.formatted_date || task.due_date,
                        image: task.has_image,
                        order: task.order
                    }))
                }));
                setProjectList(transformedData);
            } else {
                setError(response.message || 'Không thể tải dữ liệu');
            }
        } catch (error) {
            console.error('Error loading scrumboard data:', error);
            setError('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const changeValue = (e: any) => {
        const { value, id } = e.target;
        setParams({ ...params, [id]: value });
    };

    const addEditProject = (project: any = null) => {
        setTimeout(() => {
            setParams({
                id: null,
                title: '',
                color: '#3b82f6',
            });
            if (project) {
                let projectData = JSON.parse(JSON.stringify(project));
                setParams(projectData);
            }
            setIsAddProjectModal(true);
        });
    };

    const showMessage = (msg = '', type = 'success') => {
        const toast: any = Swal.mixin({
            toast: true,
            position: 'top',
            showConfirmButton: false,
            timer: 3000,
            customClass: { container: 'toast' },
        });
        toast.fire({
            icon: type,
            title: msg,
            padding: '10px 20px',
        });
    };

    const saveProject = async () => {
        if (!params.title) {
            showMessage('Tên cột là bắt buộc.', 'error');
            return false;
        }

        try {
            if (params.id) {
                //update project
                const response = await scrumboardAPI.updateProject(params.id, {
                    title: params.title,
                    color: params.color
                });
                
                if (response.success) {
                    setProjectList(projectList.map((d: any) => {
                        if (d.id === params.id) {
                            return { ...d, title: params.title, color: params.color };
                        }
                        return d;
                    }));
                    showMessage('Cột đã được cập nhật thành công.');
                } else {
                    showMessage(response.message || 'Có lỗi xảy ra', 'error');
                }
            } else {
                //add project
                const response = await scrumboardAPI.createProject({
                    title: params.title,
                    color: params.color
                });
                
                if (response.success) {
                    const newProject = {
                        id: response.data.id,
                        title: response.data.title,
                        color: response.data.color,
                        tasks: []
                    };
                    setProjectList([...projectList, newProject]);
                    showMessage('Cột đã được tạo thành công.');
                } else {
                    showMessage(response.message || 'Có lỗi xảy ra', 'error');
                }
            }
            setIsAddProjectModal(false);
        } catch (error) {
            console.error('Error saving project:', error);
            showMessage('Có lỗi xảy ra khi lưu cột', 'error');
        }
    };

    const deleteProject = async (project: any) => {
        const result = await Swal.fire({
            title: 'Bạn có chắc chắn?',
            text: "Tất cả task trong cột này sẽ bị xóa!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, xóa!',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                const response = await scrumboardAPI.deleteProject(project.id);
                
                if (response.success) {
                    setProjectList(projectList.filter((d: any) => d.id !== project.id));
                    showMessage('Cột đã được xóa thành công.');
                } else {
                    showMessage(response.message || 'Có lỗi xảy ra', 'error');
                }
            } catch (error) {
                console.error('Error deleting project:', error);
                showMessage('Có lỗi xảy ra khi xóa cột', 'error');
            }
        }
    };

    const clearProjects = async (project: any) => {
        const result = await Swal.fire({
            title: 'Xóa tất cả task?',
            text: "Tất cả task trong cột này sẽ bị xóa!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Có, xóa!',
            cancelButtonText: 'Hủy'
        });

        if (result.isConfirmed) {
            try {
                const response = await scrumboardAPI.clearProjectTasks(project.id);
                
                if (response.success) {
                    setProjectList(projectList.map((d: any) => {
                        if (d.id === project.id) {
                            return { ...d, tasks: [] };
                        }
                        return d;
                    }));
                    showMessage('Tất cả task đã được xóa.');
                } else {
                    showMessage(response.message || 'Có lỗi xảy ra', 'error');
                }
            } catch (error) {
                console.error('Error clearing project tasks:', error);
                showMessage('Có lỗi xảy ra khi xóa task', 'error');
            }
        }
    };

    const addTaskData = (e: any) => {
        const { value, id } = e.target;
        setParamsTask({ ...paramsTask, [id]: value });
    };

    const addEditTask = (projectId: any, task: any = null) => {
        setParamsTask({
            projectId: projectId,
            id: null,
            title: '',
            description: '',
            tags: '',
            date: '',
            priority: 'medium',
            assignee: '',
        });
        if (task) {
            let data = JSON.parse(JSON.stringify(task));
            data.projectId = projectId;
            data.tags = data.tags ? data.tags.toString() : '';
            setParamsTask(data);
        }
        setIsAddTaskModal(true);
    };

    const saveTask = async () => {
        if (!paramsTask.title) {
            showMessage('Tên task là bắt buộc.', 'error');
            return false;
        }
        
        try {
            const taskData = {
                project_id: paramsTask.projectId,
                title: paramsTask.title,
                description: paramsTask.description,
                tags: paramsTask.tags,
                priority: paramsTask.priority,
                assignee: paramsTask.assignee,
                due_date: paramsTask.date,
                progress: 0
            };

            if (paramsTask.id) {
                //update task
                const response = await scrumboardAPI.updateTask(paramsTask.id, taskData);
                
                if (response.success) {
                    setProjectList(projectList.map((project: any) => {
                        if (project.id === paramsTask.projectId) {
                            const updatedTasks = project.tasks.map((task: any) => {
                                if (task.id === paramsTask.id) {
                                    return {
                                        ...task,
                                        title: paramsTask.title,
                                        description: paramsTask.description,
                                        tags: paramsTask.tags?.length > 0 ? paramsTask.tags.split(',') : [],
                                        priority: paramsTask.priority,
                                        assignee: paramsTask.assignee,
                                        date: paramsTask.date || task.date
                                    };
                                }
                                return task;
                            });
                            return { ...project, tasks: updatedTasks };
                        }
                        return project;
                    }));
                    showMessage('Task đã được cập nhật thành công.');
                } else {
                    showMessage(response.message || 'Có lỗi xảy ra', 'error');
                }
            } else {
                //add task
                const response = await scrumboardAPI.createTask(taskData);
                
                if (response.success) {
                    const newTask = {
                        projectId: paramsTask.projectId,
                        id: response.data.id,
                        title: paramsTask.title,
                        description: paramsTask.description,
                        date: paramsTask.date || response.data.formatted_date,
                        tags: paramsTask.tags?.length > 0 ? paramsTask.tags.split(',') : [],
                        priority: paramsTask.priority,
                        assignee: paramsTask.assignee,
                        progress: 0,
                        image: false
                    };
                    
                    setProjectList(projectList.map((project: any) => {
                        if (project.id === paramsTask.projectId) {
                            return { ...project, tasks: [...project.tasks, newTask] };
                        }
                        return project;
                    }));
                    showMessage('Task đã được tạo thành công.');
                } else {
                    showMessage(response.message || 'Có lỗi xảy ra', 'error');
                }
            }
            setIsAddTaskModal(false);
        } catch (error) {
            console.error('Error saving task:', error);
            showMessage('Có lỗi xảy ra khi lưu task', 'error');
        }
    };

    const deleteConfirmModal = (projectId: any, task: any = null) => {
        setSelectedTask(task);
        setTimeout(() => {
            setIsDeleteModal(true);
        }, 10);
    };
    
    const deleteTask = async () => {
        try {
            const response = await scrumboardAPI.deleteTask(selectedTask.id);
            
            if (response.success) {
                setProjectList(projectList.map((project: any) => {
                    if (project.id === selectedTask.projectId) {
                        return {
                            ...project,
                            tasks: project.tasks.filter((task: any) => task.id !== selectedTask.id)
                        };
                    }
                    return project;
                }));
                showMessage('Task đã được xóa thành công.');
            } else {
                showMessage(response.message || 'Có lỗi xảy ra', 'error');
            }
            setIsDeleteModal(false);
        } catch (error) {
            console.error('Error deleting task:', error);
            showMessage('Có lỗi xảy ra khi xóa task', 'error');
        }
    };

    const handleTaskOrderChange = async (newState: any, sortable: any) => {
        if (sortable) {
            const groupId: any = sortable.el.closest('[data-group]')?.getAttribute('data-group') || 0;
            const newList = projectList.map((task: any) => {
                if (parseInt(task.id) === parseInt(groupId)) {
                    task.tasks = newState;
                }
                return task;
            });
            setProjectList(newList);

            // Update order in database
            try {
                const tasksToUpdate = newState.map((task: any, index: number) => ({
                    id: task.id,
                    project_id: parseInt(groupId),
                    order: index + 1
                }));
                
                await scrumboardAPI.updateTaskOrder(tasksToUpdate);
            } catch (error) {
                console.error('Error updating task order:', error);
                // Reload data if order update fails
                loadScrumboardData();
            }
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return 'bg-red-100 text-red-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityText = (priority: string) => {
        switch (priority) {
            case 'high': return 'Cao';
            case 'medium': return 'Trung bình';
            case 'low': return 'Thấp';
            default: return 'Trung bình';
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-500 mb-4">{error}</div>
                <button 
                    onClick={loadScrumboardData}
                    className="btn btn-primary"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">📋 Scrumboard - Long Hải Promotion</h2>
                <p className="text-gray-600">Quản lý công việc và dự án một cách trực quan</p>
                <button
                    type="button"
                    className="btn btn-primary flex mt-4"
                    onClick={() => {
                        addEditProject();
                    }}
                >
                    <IconPlus className="h-5 w-5 ltr:mr-3 rtl:ml-3" />
                    Thêm cột mới
                </button>
            </div>
            
            {/* project list  */}
            <div className="relative pt-5">
                <div className="perfect-scrollbar -mx-2 h-full">
                    <div className="flex flex-nowrap items-start gap-5 overflow-x-auto px-2 pb-2">
                        {projectList.map((project: any) => {
                            return (
                                <div key={project.id} className="panel w-80 flex-none" data-group={project.id}>
                                    <div className="mb-5 flex justify-between items-center">
                                        <div className="flex items-center">
                                            <div 
                                                className="w-3 h-3 rounded-full mr-2" 
                                                style={{ backgroundColor: project.color }}
                                            ></div>
                                            <h4 className="text-base font-semibold">{project.title}</h4>
                                            <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                                {project.tasks.length}
                                            </span>
                                        </div>

                                        <div className="flex items-center">
                                            <button onClick={() => addEditTask(project.id)} type="button" className="hover:text-primary ltr:mr-2 rtl:ml-2">
                                                <IconPlusCircle />
                                            </button>
                                            <Dropdown
                                                offset={[0, 5]}
                                                placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                                                btnClassName="hover:text-primary"
                                                button={<IconHorizontalDots className="opacity-70 hover:opacity-100" />}
                                            >
                                                <ul className="!min-w-[150px]">
                                                    <li>
                                                        <button type="button" onClick={() => addEditProject(project)}>
                                                            <IconEdit className="ltr:mr-2 rtl:ml-2" />
                                                            Chỉnh sửa
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" onClick={() => clearProjects(project)}>
                                                            <IconTrashLines className="ltr:mr-2 rtl:ml-2" />
                                                            Xóa tất cả task
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button" onClick={() => deleteProject(project)}>
                                                            <IconTrashLines className="ltr:mr-2 rtl:ml-2" />
                                                            Xóa cột
                                                        </button>
                                                    </li>
                                                </ul>
                                            </Dropdown>
                                        </div>
                                    </div>

                                    <ReactSortable
                                        list={project.tasks}
                                        setList={handleTaskOrderChange}
                                        animation={200}
                                        group={{ name: 'shared', pull: true, put: true }}
                                        ghostClass="sortable-ghost"
                                        dragClass="sortable-drag"
                                        className="connect-sorting-content min-h-[150px]"
                                    >
                                        {project.tasks.map((task: any) => {
                                            return (
                                                <div className="sortable-list " key={project.id + '' + task.id}>
                                                    <div className="mb-5 cursor-move space-y-3 rounded-md bg-[#f4f4f4] p-3 pb-5 shadow dark:bg-white-dark/20">
                                                        {task.image ? <img src="/assets/images/carousel1.jpeg" alt="images" className="h-32 w-full rounded-md object-cover" /> : ''}
                                                        <div className="text-base font-medium">{task.title}</div>
                                                        <p className="break-all text-sm text-gray-600">{task.description}</p>
                                                        
                                                        {/* Priority Badge */}
                                                        <div className="flex items-center justify-between">
                                                            <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                                                                {getPriorityText(task.priority)}
                                                            </span>
                                                            {task.assignee && (
                                                                <span className="text-xs text-gray-500">
                                                                    👤 {task.assignee}
                                                                </span>
                                                            )}
                                                        </div>

                                                        {/* Progress Bar */}
                                                        {task.progress !== undefined && (
                                                            <div className="w-full">
                                                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                                                    <span>Tiến độ</span>
                                                                    <span>{task.progress}%</span>
                                                                </div>
                                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                                    <div 
                                                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                                                                        style={{ width: `${task.progress}%` }}
                                                                    ></div>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {task.tags?.length ? (
                                                                task.tags.map((tag: any, i: any) => {
                                                                    return (
                                                                        <div key={i} className="btn btn-outline-primary flex px-2 py-1 text-xs">
                                                                            <IconTag className="shrink-0" />
                                                                            <span className="ltr:ml-2 rtl:mr-2">{tag}</span>
                                                                        </div>
                                                                    );
                                                                })
                                                            ) : (
                                                                <div className="btn flex px-2 py-1 text-white-dark shadow-none dark:border-white-dark/50 text-xs">
                                                                    <IconTag className="shrink-0" />
                                                                    <span className="ltr:ml-2 rtl:mr-2">Không có tag</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center font-medium hover:text-primary text-sm">
                                                                <IconCalendar className="shrink-0 ltr:mr-3 rtl:ml-3" />
                                                                <span>{task.date}</span>
                                                            </div>
                                                            <div className="flex items-center">
                                                                <button onClick={() => addEditTask(project.id, task)} type="button" className="hover:text-info">
                                                                    <IconEdit className="ltr:mr-3 rtl:ml-3" />
                                                                </button>
                                                                <button onClick={() => deleteConfirmModal(project.id, task)} type="button" className="hover:text-danger">
                                                                    <IconTrashLines />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </ReactSortable>
                                    <div className="pt-3">
                                        <button type="button" className="btn btn-primary mx-auto" onClick={() => addEditTask(project.id)}>
                                            <IconPlus />
                                            Thêm Task
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* add project modal */}
            <Transition appear show={isAddProjectModal} as={Fragment}>
                <Dialog as="div" open={isAddProjectModal} onClose={() => setIsAddProjectModal(false)} className="relative z-50">
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-[999] overflow-y-auto">
                        <div className="flex min-h-screen items-center justify-center px-4">
                            <DialogPanel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <button onClick={() => setIsAddProjectModal(false)} type="button" className="absolute top-4 text-white-dark hover:text-dark ltr:right-4 rtl:left-4">
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">{params.id ? 'Chỉnh sửa cột' : 'Thêm cột mới'}</div>
                                <div className="p-5">
                                    <form onSubmit={saveProject}>
                                        <div className="grid gap-5">
                                            <div>
                                                <label htmlFor="title">Tên cột</label>
                                                <input id="title" value={params.title} onChange={changeValue} type="text" className="form-input mt-1" placeholder="Nhập tên cột" />
                                            </div>
                                            <div>
                                                <label htmlFor="color">Màu sắc</label>
                                                <input id="color" value={params.color} onChange={changeValue} type="color" className="form-input mt-1 h-10" />
                                            </div>
                                        </div>

                                        <div className="mt-8 flex items-center justify-end">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setIsAddProjectModal(false)}>
                                                Hủy
                                            </button>
                                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                {params.id ? 'Cập nhật' : 'Thêm'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            
            {/* add task modal */}
            <Transition appear show={isAddTaskModal} as={Fragment}>
                <Dialog as="div" open={isAddTaskModal} onClose={() => setIsAddTaskModal(false)} className="relative z-50">
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-[999] overflow-y-auto">
                        <div className="flex min-h-screen items-center justify-center px-4">
                            <DialogPanel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <button onClick={() => setIsAddTaskModal(false)} type="button" className="absolute top-4 text-white-dark hover:text-dark ltr:right-4 rtl:left-4">
                                    <IconX />
                                </button>
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">{paramsTask.id ? 'Chỉnh sửa Task' : 'Thêm Task mới'}</div>
                                <div className="p-5">
                                    <form onSubmit={saveTask}>
                                        <div className="grid gap-5">
                                            <div>
                                                <label htmlFor="taskTitle">Tên task</label>
                                                <input id="title" value={paramsTask.title} onChange={addTaskData} type="text" className="form-input" placeholder="Nhập tên task" />
                                            </div>
                                            <div>
                                                <label htmlFor="assignee">Người thực hiện</label>
                                                <input id="assignee" value={paramsTask.assignee} onChange={addTaskData} type="text" className="form-input" placeholder="Nhập tên người thực hiện" />
                                            </div>
                                            <div>
                                                <label htmlFor="priority">Mức độ ưu tiên</label>
                                                <select id="priority" value={paramsTask.priority} onChange={addTaskData} className="form-select">
                                                    <option value="low">Thấp</option>
                                                    <option value="medium">Trung bình</option>
                                                    <option value="high">Cao</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label htmlFor="taskTag">Tags</label>
                                                <input id="tags" value={paramsTask.tags} onChange={addTaskData} type="text" className="form-input" placeholder="Nhập tags (phân cách bằng dấu phẩy)" />
                                            </div>
                                            <div>
                                                <label htmlFor="taskdesc">Mô tả</label>
                                                <textarea
                                                    id="description"
                                                    value={paramsTask.description}
                                                    onChange={addTaskData}
                                                    className="form-textarea min-h-[130px]"
                                                    placeholder="Nhập mô tả chi tiết"
                                                ></textarea>
                                            </div>
                                        </div>
                                        <div className="mt-8 flex items-center justify-end">
                                            <button onClick={() => setIsAddTaskModal(false)} type="button" className="btn btn-outline-danger">
                                                Hủy
                                            </button>
                                            <button type="submit" className="btn btn-primary ltr:ml-4 rtl:mr-4">
                                                {paramsTask.id ? 'Cập nhật' : 'Thêm'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </Dialog>
            </Transition>
            
            {/* delete task modal */}
            <Transition appear show={isDeleteModal} as={Fragment}>
                <Dialog as="div" open={isDeleteModal} onClose={() => setIsDeleteModal(false)} className="relative z-50">
                    <TransitionChild as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                        <div className="fixed inset-0 bg-[black]/60" />
                    </TransitionChild>
                    <div className="fixed inset-0 z-[999] overflow-y-auto">
                        <div className="flex min-h-screen items-center justify-center px-4">
                            <DialogPanel className="panel w-full max-w-lg overflow-hidden rounded-lg border-0 p-0 text-black dark:text-white-dark">
                                <div className="bg-[#fbfbfb] py-3 text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pl-[50px] rtl:pr-5 dark:bg-[#121c2c]">Xóa Task</div>
                                <div className="p-5">
                                    <div className="text-center">
                                        <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-full bg-red-100 text-red-600 mb-4">
                                            <IconTrashLines className="w-8 h-8" />
                                        </div>
                                        <h4 className="text-lg font-medium mb-2">Bạn có chắc chắn?</h4>
                                        <p className="text-gray-600 mb-6">Task này sẽ bị xóa vĩnh viễn và không thể khôi phục.</p>
                                        <div className="flex justify-center gap-4">
                                            <button type="button" className="btn btn-outline-danger" onClick={() => setIsDeleteModal(false)}>
                                                Hủy
                                            </button>
                                            <button type="button" className="btn btn-danger" onClick={deleteTask}>
                                                Xóa
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </Dialog>
            </Transition>
        </div>
    );
};

export default ComponentsAppsScrumBoard;
