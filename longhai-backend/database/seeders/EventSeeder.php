<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Event;
use App\Models\Ticket;
use Carbon\Carbon;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Xoá toàn bộ event trước khi seed lại
        \App\Models\Event::truncate();

        Event::create([
            'title' => 'Hoàng Dũng Concert 2024',
            'slug' => 'hoang-dung-concert-2024',
            'description' => 'Đêm nhạc đặc biệt với ca sĩ Hoàng Dũng - một trong những giọng ca nam hàng đầu Việt Nam. Chương trình sẽ mang đến những ca khúc hit nhất của anh cùng những màn trình diễn đặc sắc.',
            'venue' => 'Nhà hát Hòa Bình',
            'location_detail' => '240 Ba Tháng Hai, Quận 10, TP.HCM',
            'start_date' => '2024-12-25 19:30:00',
            'end_date' => '2024-12-25 22:30:00',
            'time' => '19:30',
            'status' => 'active',
            'display_status' => 'Đang mở bán',
            'total_seats' => 1000,
            'available_seats' => 850,
            'price' => 500000.00,
            'price_display' => 'Từ 500.000đ',
            'image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
            'map_image' => 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
            'artists' => [
                [
                    'name' => 'Hoàng Dũng',
                    'image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
                ],
                [
                    'name' => 'Vũ Cát Tường',
                    'image' => 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face'
                ]
            ],
            'ticket_prices' => [
                [
                    'name' => 'VIP',
                    'price' => 1200000.00
                ],
                [
                    'name' => 'A',
                    'price' => 800000.00
                ],
                [
                    'name' => 'B',
                    'price' => 500000.00
                ],
                [
                    'name' => 'C',
                    'price' => 300000.00
                ]
            ]
        ]);

        Event::create([
            'title' => 'Sơn Tùng M-TP Live Concert',
            'slug' => 'son-tung-mtp-live-concert',
            'description' => 'Sự kiện âm nhạc lớn nhất năm với sự xuất hiện của ca sĩ Sơn Tùng M-TP. Chương trình sẽ mang đến những màn trình diễn hoành tráng với công nghệ hiện đại.',
            'venue' => 'Sân vận động Quân khu 7',
            'location_detail' => '202 Hoàng Văn Thụ, Quận Tân Bình, TP.HCM',
            'start_date' => '2024-11-15 20:00:00',
            'end_date' => '2024-11-15 23:00:00',
            'time' => '20:00',
            'status' => 'preparing',
            'display_status' => 'Sắp mở bán',
            'total_seats' => 5000,
            'available_seats' => 5000,
            'price' => 800000.00,
            'price_display' => 'Từ 800.000đ',
            'image' => 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800&h=600&fit=crop',
            'map_image' => 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
            'artists' => [
                [
                    'name' => 'Sơn Tùng M-TP',
                    'image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
                ]
            ],
            'ticket_prices' => [
                [
                    'name' => 'VIP',
                    'price' => 2500000.00
                ],
                [
                    'name' => 'A',
                    'price' => 1500000.00
                ],
                [
                    'name' => 'B',
                    'price' => 800000.00
                ],
                [
                    'name' => 'C',
                    'price' => 500000.00
                ]
            ]
        ]);

        Event::create([
            'title' => 'Jazz Night với Trần Mạnh Tuấn',
            'slug' => 'jazz-night-tran-manh-tuan',
            'description' => 'Đêm nhạc Jazz đặc biệt với nghệ sĩ saxophone Trần Mạnh Tuấn. Một không gian âm nhạc sang trọng và ấm cúng dành cho những người yêu nhạc Jazz.',
            'venue' => 'Landmark 81',
            'location_detail' => 'Vinhomes Central Park, Quận Bình Thạnh, TP.HCM',
            'start_date' => '2024-10-20 19:00:00',
            'end_date' => '2024-10-20 21:30:00',
            'time' => '19:00',
            'status' => 'ended',
            'display_status' => 'Đã kết thúc',
            'total_seats' => 300,
            'available_seats' => 0,
            'price' => 1200000.00,
            'price_display' => '1.200.000đ',
            'image' => 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop',
            'map_image' => 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop',
            'artists' => [
                [
                    'name' => 'Trần Mạnh Tuấn',
                    'image' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
                ]
            ],
            'ticket_prices' => [
                [
                    'name' => 'VIP',
                    'price' => 1200000.00
                ],
                [
                    'name' => 'Standard',
                    'price' => 800000.00
                ]
            ]
        ]);

        // Đồng bộ display_status cho tất cả event
        $map = [
            'preparing' => 'Sắp mở bán',
            'active' => 'Đang mở bán',
            'ended' => 'Đã kết thúc',
        ];
        foreach (Event::all() as $event) {
            $event->display_status = $map[$event->status] ?? null;
            $event->save();
        }
    }
}
