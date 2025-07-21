<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\News;
use App\Models\User;
use Carbon\Carbon;

class NewsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get admin user for created_by
        $adminUser = User::where('email', 'admin@longhai.com')->first();
        $userId = $adminUser ? $adminUser->id : 1;

        $newsData = [
            [
                'title' => 'Sự kiện âm nhạc lớn nhất năm 2024 sắp diễn ra',
                'slug' => 'su-kien-am-nhac-lon-nhat-nam-2024',
                'excerpt' => 'Chuỗi sự kiện âm nhạc đặc biệt với sự tham gia của nhiều nghệ sĩ nổi tiếng sẽ diễn ra vào tháng 12/2024.',
                'content' => '<p>Long Hải Promotion tự hào thông báo về chuỗi sự kiện âm nhạc lớn nhất năm 2024. Sự kiện sẽ quy tụ những nghệ sĩ hàng đầu Việt Nam và quốc tế, mang đến những trải nghiệm âm nhạc tuyệt vời cho khán giả.</p><p>Chương trình sẽ bao gồm:</p><ul><li>Buổi hòa nhạc cổ điển</li><li>Đêm nhạc rock</li><li>Festival âm nhạc điện tử</li><li>Workshop âm nhạc</li></ul><p>Vé sẽ được bán từ ngày 1/12/2024. Hãy đăng ký nhận thông báo sớm để có cơ hội mua vé với giá ưu đãi!</p>',
                'image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
                'author' => 'Long Hải Team',
                'category' => 'Sự kiện',
                'tags' => ['âm nhạc', 'nghệ sĩ', 'concert', 'festival'],
                'read_time' => 5,
                'featured' => true,
                'published_at' => Carbon::now()->subDays(2),
                'status' => 'published',
                'meta_title' => 'Sự kiện âm nhạc lớn nhất năm 2024 - Long Hải Promotion',
                'meta_description' => 'Khám phá chuỗi sự kiện âm nhạc đặc biệt với sự tham gia của nhiều nghệ sĩ nổi tiếng.',
                'created_by' => $userId,
                'updated_by' => $userId,
            ],
            [
                'title' => 'Nghệ sĩ mới gia nhập Long Hải Promotion',
                'slug' => 'nghe-si-moi-gia-nhap-long-hai',
                'excerpt' => 'Chúng tôi vui mừng chào đón những tài năng mới gia nhập đội ngũ nghệ sĩ của Long Hải Promotion.',
                'content' => '<p>Long Hải Promotion vui mừng thông báo về việc ký hợp đồng với 3 nghệ sĩ tài năng mới:</p><h3>1. Ca sĩ Minh Anh</h3><p>Với giọng hát ngọt ngào và phong cách biểu diễn chuyên nghiệp, Minh Anh sẽ mang đến những ca khúc ballad đầy cảm xúc.</p><h3>2. Nhóm nhạc The Rockers</h3><p>Nhóm nhạc rock trẻ với 5 thành viên tài năng, chuyên về dòng nhạc rock alternative và indie.</p><h3>3. DJ TechMaster</h3><p>DJ chuyên nghiệp với 10 năm kinh nghiệm trong lĩnh vực âm nhạc điện tử.</p><p>Các nghệ sĩ mới sẽ tham gia vào các sự kiện sắp tới của Long Hải Promotion.</p>',
                'image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
                'author' => 'Admin',
                'category' => 'Nghệ sĩ',
                'tags' => ['nghệ sĩ', 'tuyển dụng', 'ca sĩ', 'nhóm nhạc'],
                'read_time' => 3,
                'featured' => false,
                'published_at' => Carbon::now()->subDays(3),
                'status' => 'published',
                'meta_title' => 'Nghệ sĩ mới gia nhập Long Hải Promotion',
                'meta_description' => 'Khám phá những tài năng mới gia nhập đội ngũ nghệ sĩ của Long Hải Promotion.',
                'created_by' => $userId,
                'updated_by' => $userId,
            ],
            [
                'title' => 'Cập nhật về chính sách vé và hoàn tiền',
                'slug' => 'cap-nhat-chinh-sach-ve-hoan-tien',
                'excerpt' => 'Thông báo quan trọng về việc cập nhật chính sách vé và quy trình hoàn tiền cho khách hàng.',
                'content' => '<p>Để cải thiện trải nghiệm của khách hàng, Long Hải Promotion đã cập nhật chính sách vé và quy trình hoàn tiền:</p><h3>Chính sách vé mới:</h3><ul><li>Vé có thể chuyển nhượng cho người khác trước 24h</li><li>Giảm giá 20% cho nhóm từ 5 người trở lên</li><li>Vé VIP bao gồm meet & greet với nghệ sĩ</li></ul><h3>Quy trình hoàn tiền:</h3><ul><li>Hoàn tiền 100% nếu hủy trước 7 ngày</li><li>Hoàn tiền 50% nếu hủy trước 3 ngày</li><li>Không hoàn tiền nếu hủy trong vòng 24h</li></ul><p>Chính sách mới sẽ áp dụng từ ngày 1/1/2025.</p>',
                'image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
                'author' => 'Customer Service',
                'category' => 'Thông báo',
                'tags' => ['chính sách', 'vé', 'hoàn tiền', 'khách hàng'],
                'read_time' => 4,
                'featured' => false,
                'published_at' => Carbon::now()->subDays(4),
                'status' => 'published',
                'meta_title' => 'Cập nhật chính sách vé và hoàn tiền - Long Hải Promotion',
                'meta_description' => 'Thông báo quan trọng về việc cập nhật chính sách vé và quy trình hoàn tiền cho khách hàng.',
                'created_by' => $userId,
                'updated_by' => $userId,
            ],
            [
                'title' => 'Behind the scenes: Chuẩn bị cho concert mùa hè',
                'slug' => 'behind-scenes-concert-mua-he',
                'excerpt' => 'Khám phá những khoảnh khắc thú vị trong quá trình chuẩn bị cho concert mùa hè sắp tới.',
                'content' => '<p>Hãy cùng chúng tôi khám phá những khoảnh khắc thú vị trong quá trình chuẩn bị cho concert mùa hè sắp tới!</p><h3>Giai đoạn 1: Lên ý tưởng</h3><p>Đội ngũ sáng tạo đã dành 2 tháng để lên ý tưởng cho concept chính của concert.</p><h3>Giai đoạn 2: Thiết kế sân khấu</h3><p>Sân khấu sẽ có thiết kế độc đáo với hệ thống ánh sáng LED hiện đại.</p><h3>Giai đoạn 3: Tập luyện</h3><p>Các nghệ sĩ đang tập luyện chăm chỉ để mang đến màn trình diễn hoàn hảo.</p><h3>Giai đoạn 4: Kỹ thuật</h3><p>Đội ngũ kỹ thuật đang kiểm tra và cài đặt các thiết bị âm thanh, ánh sáng.</p><p>Concert mùa hè sẽ diễn ra vào tháng 7/2025. Hãy đón chờ!</p>',
                'image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
                'author' => 'Production Team',
                'category' => 'Behind the scenes',
                'tags' => ['concert', 'production', 'mùa hè', 'sân khấu'],
                'read_time' => 6,
                'featured' => true,
                'published_at' => Carbon::now()->subDays(5),
                'status' => 'published',
                'meta_title' => 'Behind the scenes: Chuẩn bị cho concert mùa hè',
                'meta_description' => 'Khám phá những khoảnh khắc thú vị trong quá trình chuẩn bị cho concert mùa hè sắp tới.',
                'created_by' => $userId,
                'updated_by' => $userId,
            ],
            [
                'title' => 'Phỏng vấn độc quyền với nghệ sĩ chính',
                'slug' => 'phong-van-nghe-si-chinh',
                'excerpt' => 'Cuộc trò chuyện thú vị với nghệ sĩ chính về dự án âm nhạc mới và những kế hoạch sắp tới.',
                'content' => '<p>Chúng tôi đã có cuộc trò chuyện thú vị với nghệ sĩ chính về dự án âm nhạc mới và những kế hoạch sắp tới.</p><h3>Về dự án mới:</h3><p>"Tôi rất hào hứng với dự án album mới này. Đây sẽ là một bước tiến quan trọng trong sự nghiệp âm nhạc của tôi."</p><h3>Về sự hợp tác với Long Hải Promotion:</h3><p>"Long Hải Promotion là một đối tác tuyệt vời. Họ hiểu rõ về âm nhạc và luôn hỗ trợ nghệ sĩ hết mình."</p><h3>Về kế hoạch tương lai:</h3><p>"Tôi sẽ tiếp tục sáng tác và biểu diễn. Có thể sẽ có tour diễn quốc tế trong tương lai."</p><p>Album mới sẽ được phát hành vào tháng 3/2025.</p>',
                'image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
                'author' => 'Music Reporter',
                'category' => 'Phỏng vấn',
                'tags' => ['phỏng vấn', 'nghệ sĩ', 'dự án', 'album'],
                'read_time' => 8,
                'featured' => false,
                'published_at' => Carbon::now()->subDays(6),
                'status' => 'published',
                'meta_title' => 'Phỏng vấn độc quyền với nghệ sĩ chính - Long Hải Promotion',
                'meta_description' => 'Cuộc trò chuyện thú vị với nghệ sĩ chính về dự án âm nhạc mới và những kế hoạch sắp tới.',
                'created_by' => $userId,
                'updated_by' => $userId,
            ],
            [
                'title' => 'Công nghệ mới trong sản xuất âm nhạc',
                'slug' => 'cong-nghe-moi-san-xuat-am-nhac',
                'excerpt' => 'Tìm hiểu về những công nghệ tiên tiến được áp dụng trong quá trình sản xuất âm nhạc hiện đại.',
                'content' => '<p>Long Hải Promotion luôn đi đầu trong việc áp dụng công nghệ mới vào sản xuất âm nhạc. Hãy cùng tìm hiểu về những công nghệ tiên tiến đang được sử dụng:</p><h3>1. AI trong sáng tác âm nhạc</h3><p>Trí tuệ nhân tạo đang được sử dụng để hỗ trợ quá trình sáng tác và sản xuất âm nhạc.</p><h3>2. Hệ thống âm thanh 3D</h3><p>Công nghệ âm thanh 3D mang đến trải nghiệm nghe nhạc sống động hơn.</p><h3>3. Streaming trực tuyến chất lượng cao</h3><p>Hỗ trợ streaming 4K và âm thanh lossless cho các sự kiện trực tuyến.</p><h3>4. Công nghệ VR/AR</h3><p>Thực tế ảo và thực tế tăng cường được áp dụng trong các buổi biểu diễn.</p><p>Những công nghệ này sẽ được áp dụng trong các sự kiện sắp tới của Long Hải Promotion.</p>',
                'image' => 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
                'author' => 'Tech Team',
                'category' => 'Công nghệ',
                'tags' => ['công nghệ', 'sản xuất', 'âm nhạc', 'AI', 'VR'],
                'read_time' => 7,
                'featured' => false,
                'published_at' => Carbon::now()->subDays(7),
                'status' => 'published',
                'meta_title' => 'Công nghệ mới trong sản xuất âm nhạc - Long Hải Promotion',
                'meta_description' => 'Tìm hiểu về những công nghệ tiên tiến được áp dụng trong quá trình sản xuất âm nhạc hiện đại.',
                'created_by' => $userId,
                'updated_by' => $userId,
            ],
        ];

        foreach ($newsData as $news) {
            News::create($news);
        }

        $this->command->info('News seeded successfully!');
    }
}
