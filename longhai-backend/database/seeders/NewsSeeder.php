<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class NewsSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('news')->insert([
            [
                'title' => 'Sự kiện công nghệ lớn nhất 2025',
                'slug' => Str::slug('Sự kiện công nghệ lớn nhất 2025'),
                'excerpt' => 'Tổng hợp các hoạt động nổi bật tại hội chợ công nghệ 2025.',
                'content' => '<p>Hội chợ công nghệ 2025 quy tụ hàng trăm doanh nghiệp và chuyên gia trong lĩnh vực công nghệ, mang đến nhiều trải nghiệm mới mẻ cho khách tham quan.</p>',
                'image' => null,
                'author' => 'Admin',
                'category' => 'su-kien',
                'tags' => json_encode(['công nghệ', 'hội chợ', '2025']),
                'read_time' => 5,
                'featured' => true,
                'published_at' => Carbon::now()->subDays(2),
                'status' => 'published',
                'meta_title' => 'Sự kiện công nghệ lớn nhất 2025',
                'meta_description' => 'Tin tức về hội chợ công nghệ lớn nhất năm 2025.',
                'created_by' => 2,
                'updated_by' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Live Concert Summer: Đêm nhạc hội bùng nổ',
                'slug' => Str::slug('Live Concert Summer: Đêm nhạc hội bùng nổ'),
                'excerpt' => 'Đêm nhạc hội mùa hè với sự góp mặt của nhiều nghệ sĩ nổi tiếng.',
                'content' => '<p>Live Concert Summer hứa hẹn mang đến những màn trình diễn sôi động, bùng nổ cảm xúc cho khán giả.</p>',
                'image' => null,
                'author' => 'Admin',
                'category' => 'am-nhac',
                'tags' => json_encode(['concert', 'summer', 'âm nhạc']),
                'read_time' => 4,
                'featured' => false,
                'published_at' => Carbon::now()->subDays(5),
                'status' => 'published',
                'meta_title' => 'Live Concert Summer',
                'meta_description' => 'Tin tức về đêm nhạc hội mùa hè.',
                'created_by' => 2,
                'updated_by' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Hội thảo Khởi nghiệp: Cơ hội và thách thức',
                'slug' => Str::slug('Hội thảo Khởi nghiệp: Cơ hội và thách thức'),
                'excerpt' => 'Chia sẻ kinh nghiệm khởi nghiệp cùng các chuyên gia hàng đầu.',
                'content' => '<p>Hội thảo khởi nghiệp là nơi gặp gỡ, trao đổi và học hỏi dành cho các bạn trẻ đam mê kinh doanh.</p>',
                'image' => null,
                'author' => 'Admin',
                'category' => 'hoi-thao',
                'tags' => json_encode(['khởi nghiệp', 'hội thảo', 'kinh doanh']),
                'read_time' => 6,
                'featured' => false,
                'published_at' => Carbon::now()->subDays(10),
                'status' => 'published',
                'meta_title' => 'Hội thảo Khởi nghiệp',
                'meta_description' => 'Tin tức về hội thảo khởi nghiệp.',
                'created_by' => 2,
                'updated_by' => 2,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
