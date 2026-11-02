# Sổ lưu bút chung và duyệt lời chúc

Mọi thiệp dùng cùng một danh sách lời chúc đã duyệt. Nguồn thiệp, khách và sự kiện vẫn được lưu để đối chiếu nhưng không tách sổ công khai. Lời chúc mới có trạng thái `pending`; chỉ `approved` được trả về qua API công khai. `rejected` giữ nguyên dữ liệu và ẩn khỏi website.

## Chuẩn bị Supabase

1. Chạy `supabase/migrations/202611020001_moderated_guestbook.sql` trong SQL Editor trước khi triển khai code mới. Migration giữ nguyên lời chúc cũ và đưa chúng vào hàng chờ; chạy lại không đặt lại lời chúc đã duyệt. Lưu kết quả `moderation` để kiểm tra.
2. Mở Authentication → Users → Add user → Create new user. Dùng email của chủ thiệp, tự chọn mật khẩu, xác nhận email (Auto Confirm User nếu tạo thủ công). Không gửi mật khẩu hoặc khóa máy chủ qua chat.
3. Trên Vercel và `.env.local` khi chạy local, thêm biến máy chủ `WEDDING_ADMIN_EMAILS` chứa email này. Nếu có hai quản trị viên, ngăn cách bằng dấu phẩy. Giữ các biến Supabase máy chủ đã cấu hình.

## Sử dụng

Mở `/admin/wishes`; nếu chưa đăng nhập, trang chuyển sang `/admin/login`. Dùng email/mật khẩu Supabase Auth vừa tạo. Người dùng Auth khác không có email trong danh sách cho phép không thể truy cập. Mọi trang quản trị và thao tác duyệt đều xác thực lại token với Supabase. Cookie phiên HttpOnly, SameSite Strict, Secure trên production, hết hạn tối đa một giờ; sau đó đăng nhập lại.

- **Chờ duyệt:** xem lời chúc chưa công khai, kể cả lời chúc cũ.
- **Duyệt hiển thị:** xuất hiện trên sổ chung sau khi khách tải lại trang.
- **Ẩn lời chúc:** không xuất hiện công khai; không xóa nội dung.
- **Chuyển chờ duyệt:** gỡ lời chúc khỏi danh sách công khai và xem lại sau.

Không đặt đường dẫn trang quản trị vào thiệp gửi khách. Trang quản trị có `noindex`; quyền truy cập được bảo vệ bằng xác thực, không dựa vào việc giấu đường dẫn. Website không lưu hoặc hiển thị mật khẩu, refresh token hay service-role key cho khách.

Nếu migration chưa được áp dụng, API lời chúc báo chưa khả dụng thay vì trả dữ liệu chưa duyệt. Tài khoản/biến quản trị chưa cấu hình không mở quyền công khai và không ảnh hưởng việc xem thiệp hoặc gửi RSVP.

## Kiểm tra

`npm run test:unit` xác nhận migration bảo toàn nội dung, trạng thái mặc định và quyền truy cập. `npm run test:browser` kiểm tra album, phân nhóm thiệp, gửi lời chúc chờ duyệt, đăng nhập quản trị, duyệt/ẩn, chống giả mạo cookie và danh sách chung. Các kiểm tra dùng PostgreSQL/PostgREST/Auth giả lập cục bộ; không ghi dữ liệu vào Supabase thật.
