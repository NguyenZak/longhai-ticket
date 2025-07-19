<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Banner;

class BannerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $banners = [
            [
                'title' => 'Sự kiện nổi bật',
                'description' => 'Khám phá các sự kiện đặc biệt và độc đáo được tổ chức bởi Long Hải Promotion',
                'image' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1920&h=800&fit=crop',
                'mobile_image' => 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=600&fit=crop',
                'link_url' => '/events',
                'button_text' => 'Xem ngay',
                'sort_order' => 1,
                'is_active' => true,
            ],
            [
                'title' => 'Đặt vé dễ dàng',
                'description' => 'Trải nghiệm mua vé trực tuyến nhanh chóng và an toàn với Long Hải Promotion',
                'image' => 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1920&h=800&fit=crop',
                'mobile_image' => 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=800&h=600&fit=crop',
                'link_url' => '/events',
                'button_text' => 'Mua vé',
                'sort_order' => 2,
                'is_active' => true,
            ],
            [
                'title' => 'Long Hải Promotion',
                'description' => 'Nền tảng bán vé hàng đầu Việt Nam với công nghệ hiện đại và dịch vụ chuyên nghiệp',
                'image' => 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1920&h=800&fit=crop',
                'mobile_image' => 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&h=600&fit=crop',
                'link_url' => '/about',
                'button_text' => 'Tìm hiểu',
                'sort_order' => 3,
                'is_active' => true,
            ],
        ];

        foreach ($banners as $banner) {
            Banner::create($banner);
        }
    }
} 