<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\ScrumboardProject;
use App\Models\ScrumboardTask;

class ScrumboardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create projects
        $projects = [
            [
                'title' => 'Đang thực hiện',
                'color' => '#3b82f6',
                'order' => 1,
                'tasks' => [
                    [
                        'title' => 'Thiết kế poster cho sự kiện Jazz Night',
                        'description' => 'Tạo poster chuyên nghiệp cho sự kiện Jazz Night với Trần Mạnh Tuấn',
                        'tags' => ['design', 'marketing'],
                        'priority' => 'high',
                        'assignee' => 'Nguyễn Văn A',
                        'progress' => 75,
                        'due_date' => '2024-07-15',
                        'order' => 1
                    ],
                    [
                        'title' => 'Chuẩn bị sân khấu cho Hoàng Dũng Concert',
                        'description' => 'Kiểm tra âm thanh, ánh sáng và bố trí sân khấu',
                        'tags' => ['technical', 'setup'],
                        'priority' => 'medium',
                        'assignee' => 'Trần Thị B',
                        'progress' => 60,
                        'due_date' => '2024-07-20',
                        'order' => 2
                    ],
                ]
            ],
            [
                'title' => 'Chờ xử lý',
                'color' => '#f59e0b',
                'order' => 2,
                'tasks' => [
                    [
                        'title' => 'Đặt vé cho Sơn Tùng MTP Live Concert',
                        'description' => 'Liên hệ đối tác để đặt vé và xác nhận số lượng',
                        'tags' => ['booking', 'partnership'],
                        'priority' => 'high',
                        'assignee' => 'Lê Văn C',
                        'progress' => 0,
                        'due_date' => '2024-07-25',
                        'order' => 1
                    ],
                    [
                        'title' => 'Tạo nội dung quảng cáo Facebook',
                        'description' => 'Viết copy và chuẩn bị hình ảnh cho chiến dịch quảng cáo',
                        'tags' => ['social', 'content'],
                        'priority' => 'medium',
                        'assignee' => 'Phạm Thị D',
                        'progress' => 0,
                        'due_date' => '2024-07-18',
                        'order' => 2
                    ],
                ]
            ],
            [
                'title' => 'Hoàn thành',
                'color' => '#10b981',
                'order' => 3,
                'tasks' => [
                    [
                        'title' => 'Lên kế hoạch tổng thể tháng 7',
                        'description' => 'Hoàn thành kế hoạch marketing và sự kiện cho tháng 7',
                        'tags' => ['planning'],
                        'priority' => 'high',
                        'assignee' => 'Hoàng Văn E',
                        'progress' => 100,
                        'due_date' => '2024-07-01',
                        'order' => 1
                    ],
                    [
                        'title' => 'Cập nhật website sự kiện',
                        'description' => 'Thêm thông tin mới về các sự kiện sắp diễn ra',
                        'tags' => ['website', 'update'],
                        'priority' => 'medium',
                        'assignee' => 'Vũ Thị F',
                        'progress' => 100,
                        'due_date' => '2024-07-05',
                        'order' => 2
                    ],
                ]
            ],
            [
                'title' => 'Đánh giá',
                'color' => '#8b5cf6',
                'order' => 4,
                'tasks' => [
                    [
                        'title' => 'Review hiệu quả chiến dịch tháng 6',
                        'description' => 'Phân tích dữ liệu và đánh giá kết quả các sự kiện đã tổ chức',
                        'tags' => ['analytics', 'review'],
                        'priority' => 'low',
                        'assignee' => 'Đỗ Văn G',
                        'progress' => 30,
                        'due_date' => '2024-07-10',
                        'order' => 1
                    ],
                ]
            ],
        ];

        foreach ($projects as $projectData) {
            $tasks = $projectData['tasks'];
            unset($projectData['tasks']);
            
            $project = ScrumboardProject::create($projectData);
            
            foreach ($tasks as $taskData) {
                $taskData['project_id'] = $project->id;
                ScrumboardTask::create($taskData);
            }
        }
    }
}
