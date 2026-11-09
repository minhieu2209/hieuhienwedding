# Thiệp cưới Minh Hiếu & Thu Hiền

Next.js 16 / React 19, giao diện xanh–kem, dữ liệu sự kiện và khách mời qua Supabase.

Toàn bộ website căn giữa, tối đa 812px và co về 100% trên mobile. Nút nhạc/popup bám góc dưới bên phải màn hình; nút ngôn ngữ VIE/KOR bám góc trên bên phải màn hình. Khung xem ảnh vẫn bám khổ website. Nhạc thử tự phát khi mở trang; nếu trình duyệt chặn âm thanh, lần chạm/nhấp hoặc phím đầu tiên sẽ kích hoạt lại. Sau khi người dùng chủ động tạm dừng, tương tác trang và việc đổi bài không tự bật nhạc trở lại.

Biểu tượng nhạc và đĩa trong popup xoay khi phát, đứng yên khi tạm dừng và tiếp tục từ góc đang dừng khi phát lại; tôn trọng cài đặt giảm chuyển động của thiết bị. Danh sách lời chúc cuộn trong vùng riêng (tối đa 512px trên mobile, 640px trên desktop); nút tải thêm nằm bên ngoài vùng cuộn để vẫn dễ sử dụng khi có nhiều lời chúc.

Nhạc có autoplay và preload ngay trong HTML để bắt đầu sớm khi trình duyệt cho phép, không đợi JavaScript khởi tạo. Nếu trình duyệt chặn tự phát âm thanh, lần chạm/nhấp đầu tiên vẫn là điều kiện bắt buộc. Tạm dừng chủ động sẽ tắt autoplay cho đến khi người xem bấm phát hoặc chọn bài.

Ảnh Hero được tải ưu tiên qua Next Image thay vì tải nguyên ảnh nền lớn. Ảnh thường dùng chất lượng 90, ảnh phóng lớn dùng 95; nếu dịch vụ tối ưu ảnh lỗi, ảnh gốc được dùng làm dự phòng. Album giữ các ảnh đã xem, tải sẵn trang kế tiếp khi tới gần album và không gỡ ảnh khỏi trang khi lật lại. Hiệu ứng lật chạy trên khung cố định và tôn trọng cài đặt giảm chuyển động.

## Bảy mẫu thiệp

| Đường dẫn | Ngôn ngữ | Sự kiện | Sổ lưu bút |
| --- | --- | --- | --- |
| `/groom/NGV` | Việt | Nhà trai 29/11/2026 10:00 | Chung, có duyệt |
| `/groom/friends` | Việt | Nhà trai 29/11/2026 10:00 | Chung, có duyệt |
| `/groom/UFC97` | Việt | Nhà trai 29/11/2026 10:00 | Chung, có duyệt |
| `/bride/Partron` | Việt/Hàn | Báo hỷ 04/12/2026 17:30 | Chung, có duyệt |
| `/bride/friends` | Việt | Nhà gái 28/11/2026 10:00 | Chung, có duyệt |
| `/UncleLEE` | Hàn | Nhà trai 29/11/2026 10:00 | Chung, có duyệt |
| `/bride/friends1` | Việt | Báo hỷ 04/12/2026 17:30 | Chung, có duyệt |

Tất cả giờ là giờ Việt Nam (UTC+7). UncleLEE giữ cô dâu/gia đình nhà gái trước dù dự sự kiện nhà trai. Link `/` và các đường dẫn tiếng Việt cũ vẫn đọc được theo mẫu tương ứng. Partron chuyển ngôn ngữ bằng `?lang=ko`; tên riêng giữ nguyên tiếng Việt.

Sổ lưu bút dùng chung cho cả hai bên. Lời chúc mới chờ duyệt tại `/admin/wishes`; xem [thiết lập tài khoản và hàng chờ](docs/guestbook-moderation.md). Album hiển thị đủ 11 ảnh với nút lật trang, bàn phím và vuốt trên điện thoại.

## Chạy local

Dùng Node.js 24. Cài dependencies theo lockfile:

```bash
npm ci
npm run dev
```

Sao chép `.env.example` thành `.env.local` và điền giá trị qua cấu hình bảo mật khi cần. Thiệp có bản dự phòng để xem khi chưa có khóa máy chủ; khi có URL và khóa, ứng dụng tự dùng DB trừ khi WEDDING_DATABASE_ENABLED=false; các form chỉ hoạt động sau khi schema, khóa máy chủ, trạng thái duyệt và mã khách đã được chuẩn bị.

## Thiết lập dữ liệu thật

Đọc [hướng dẫn Supabase](docs/supabase-setup.md) trước khi chạy migration hoặc thay quyền truy cập. Migration không tự chạy khi build/deploy. Bản Hàn vẫn cần được duyệt trước khi phát hành; SQL seed để tất cả ở draft.

Link cá nhân dùng trực tiếp `guest_code`, ví dụ `/groom/friends?guest=GF-0024`. Lấy mã trong bảng `wedding_guests`, dùng đúng nhóm thiệp và đặt `is_active=true`. Link token đã gửi trước đây vẫn hoạt động; RSVP/lời chúc từ cả hai dạng link gắn cùng UUID khách, giữ nguyên phản hồi đã có.

Áp dụng `supabase/migrations/202611040001_guest_code_links.sql` một lần để thêm khách mới mà không cần token/hash. Dùng `scripts/guests-template.csv` làm mẫu; SQL nhập khách kích hoạt khách mới, cập nhật tên khách cũ và giữ trạng thái khóa của khách đã có. Tiện ích `guests:links` chỉ là công cụ xuất file tùy chọn, không thay đổi DB. Danh sách thật và bản lưu link riêng nằm ngoài Git.

## Kiểm tra

Build production dùng `next build --webpack` để tránh lỗi xử lý font Noto Serif KR của Turbopack trong Next.js 16.3.8. Giữ nguyên font và cấu hình hiển thị hiện tại; Vercel chạy lệnh này qua `npm run build`.

```bash
npm run lint
npm run test:unit
npm run build
npm run test:browser
```

Browser tests cần Chromium: chạy `npx playwright install chromium`, hoặc trỏ PLAYWRIGHT_CHROMIUM_EXECUTABLE vào Chromium đã cài. Chúng dựng hai ứng dụng Next và một PostgreSQL/PostgREST fixture cục bộ ở các cổng 3100, 3101, 4711. Không dùng các cổng đó cho dịch vụ khác khi chạy kiểm tra.

Để kiểm tra HTTP với một server đã chạy, dùng `npm run test:smoke`; có thể đặt TEST_BASE_URL. Kiểm tra Supabase thật và deployment Vercel không được suy ra từ kết quả fixture.

## Thay đổi nội dung

Khi DB đã bật, nội dung lấy từ wedding_invitation_contents, ngày giờ từ wedding_events, tên khách từ wedding_guests. `data/invitation-copy.json` và `data/invitation-catalog.ts` là bản mặc định/dự phòng. Mỗi nhóm có toàn bộ lời dẫn và nhãn riêng, hỗ trợ cách xưng hô tương ứng. Không sửa tên khách vào code.

Bản Hàn Partron và UncleLEE đã được cập nhật từ file dịch chủ thiệp gửi ngày 06/11/2026: 26 trường có chỉnh sửa. Sau khi Vercel triển khai bản code này, chạy `supabase/manual/07_apply_reviewed_korean.sql` để áp các trường đó vào Supabase; kết quả dự kiến `updated_invitations=2`, `reviewed_fields=26`, `all_reviewed_fields_match=true`. File giữ các trường tùy chỉnh khác, bản Việt, sự kiện, khách, RSVP và lời chúc. Chữ N trong câu đếm ngược được chuẩn hóa thành `{days}` để hiển thị số ngày thực; đoạn cảm ơn giữ các dòng trống theo bản dịch. Cỡ chữ không thay đổi.

### Xưng hô theo người nhận

Tên người/nhóm nhận có nguyên từ “Em” ở bất kỳ vị trí nào thì thiệp tự xưng “Anh Chị”, gọi người nhận là “Em”; có “bạn” thì dùng “chúng mình” / “Bạn”; còn lại tự xưng “chúng em” và gọi theo danh xưng Anh/Chị. Không phân biệt hoa/thường; nếu có cả “Em” và “bạn” thì ưu tiên “Em” (như GF-0022).

NGV và Partron luôn dùng “chúng em” / “Anh/Chị/Em”. UFC 97 luôn tự xưng “chúng em”, gọi người nhận là “Anh Em”. Nhóm CKLS gọi là “Các bạn”. UncleLEE giữ cách xưng hô đặc biệt và bản tiếng Hàn hiện có. Câu mời, lời dẫn, sổ lưu bút, cảm ơn RSVP và phần kết dùng thống nhất cách xưng hô; tên khách và lời chúc khách đã gửi được giữ nguyên.
