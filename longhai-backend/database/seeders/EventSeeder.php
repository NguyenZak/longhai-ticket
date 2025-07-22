<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('events')->insert([
            [
                'title' => 'Hội chợ Công nghệ 2025',
                'slug' => Str::slug('Hội chợ Công nghệ 2025'),
                'venue' => 'Trung tâm Hội nghị Quốc gia',
                'start_date' => Carbon::now()->addDays(10),
                'end_date' => Carbon::now()->addDays(12),
                'description' => 'Sự kiện công nghệ lớn nhất năm 2025.',
                'banner' => null,
                'status' => 'confirmed',
                'min_price' => 100000,
                'max_price' => 500000,
                'price_range_display' => '100.000 - 500.000 VNĐ',
                'price_display' => 'Từ 100.000 VNĐ',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Live Concert Summer',
                'slug' => Str::slug('Live Concert Summer'),
                'venue' => 'Sân vận động Mỹ Đình',
                'start_date' => Carbon::now()->addDays(20),
                'end_date' => Carbon::now()->addDays(20),
                'description' => 'Đêm nhạc hội mùa hè với nhiều nghệ sĩ nổi tiếng.',
                'banner' => null,
                'status' => 'pending',
                'min_price' => 200000,
                'max_price' => 1000000,
                'price_range_display' => '200.000 - 1.000.000 VNĐ',
                'price_display' => 'Từ 200.000 VNĐ',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'title' => 'Hội thảo Khởi nghiệp',
                'slug' => Str::slug('Hội thảo Khởi nghiệp'),
                'venue' => 'Đại học Bách Khoa',
                'start_date' => Carbon::now()->addDays(30),
                'end_date' => Carbon::now()->addDays(31),
                'description' => 'Chia sẻ kinh nghiệm khởi nghiệp cùng các chuyên gia.',
                'banner' => null,
                'status' => 'completed',
                'min_price' => 0,
                'max_price' => 0,
                'price_range_display' => 'Miễn phí',
                'price_display' => 'Miễn phí',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }
}
