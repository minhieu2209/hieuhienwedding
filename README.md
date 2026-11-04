# Thiệp cưới Minh Hiếu & Thu Hiền

Next.js 16 / React 19, giao diện xanh–kem, dữ liệu sự kiện và khách mời qua Supabase.

Toàn bộ website căn giữa, tối đa 1000px và co về 100% trên mobile. Nút nhạc/popup bám góc dưới bên phải màn hình; nút ngôn ngữ và khung xem ảnh vẫn bám khổ website. Nhạc thử tự phát khi mở trang; nếu trình duyệt chặn âm thanh, lần chạm/nhấp hoặc phím đầu tiên sẽ kích hoạt lại. Sau khi người dùng chủ động tạm dừng, tương tác trang và việc đổi bài không tự bật nhạc trở lại.

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

Danh sách khách thật và file link cá nhân nằm ở `.local/` hoặc vị trí quản trị riêng, không commit. Dùng `scripts/guests-template.csv` làm mẫu và giữ guest_code ổn định. Có tiện ích chuẩn bị SQL import và cấp link; xem hướng dẫn chi tiết để tránh đổi link đã phát hành.

## Kiểm tra

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

### Xưng hô theo người nhận

Tên người/nhóm nhận có nguyên từ “Em” ở bất kỳ vị trí nào thì thiệp tự xưng “Anh Chị”, gọi người nhận là “Em”; có “bạn” thì dùng “chúng mình” / “Bạn”; còn lại tự xưng “chúng em” và gọi theo danh xưng Anh/Chị. Không phân biệt hoa/thường; nếu có cả “Em” và “bạn” thì ưu tiên “Em” (như GF-0022).

NGV và Partron luôn dùng “chúng em” / “Anh/Chị/Em”. UFC 97 gọi người nhận là “Anh Em”, phần tự xưng vẫn theo quy tắc từ khóa. Nhóm CKLS gọi là “Các bạn”. UncleLEE giữ cách xưng hô đặc biệt và bản tiếng Hàn hiện có. Câu mời, lời dẫn, sổ lưu bút, cảm ơn RSVP và phần kết dùng thống nhất cách xưng hô; tên khách và lời chúc khách đã gửi được giữ nguyên.
