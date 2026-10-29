# Thiết lập Supabase và phát hành 7 thiệp

Ứng dụng dùng API máy chủ cho RSVP/lời chúc. Không đưa service-role/secret key vào biến NEXT_PUBLIC_ hoặc vào Git. Public key hiện có không thay thế được khóa máy chủ.

## 1. Đọc cấu trúc đang chạy

Chạy `supabase/manual/00_preflight.sql` trong Supabase SQL Editor và đối chiếu kết quả trước khi thay đổi. Truy vấn chỉ đọc cột/default/identity, constraints, grants, RLS và policies, không đọc tên khách. Lưu lại grants/policies và bản sao dữ liệu hiện có để có thể quay lại cấu hình cũ nếu cần.

Preflight thực tế chủ thiệp cung cấp đã xác nhận cả hai id là identity BY DEFAULT; các cột bắt buộc và policies anon khớp với dữ liệu thử. Bảng RSVP cũ có check guest_count=1..20; migration thay đúng check này để giữ dữ liệu cũ, đồng thời chỉ cho phép 0 ở phản hồi mới không tham dự. Không thay cơ chế id hoặc chuẩn hóa lại các phản hồi cũ.

## 2. Bổ sung dữ liệu, giữ ứng dụng cũ đang hoạt động

Áp dụng từng file theo thứ tự sau khi đã đối chiếu preflight:

1. `supabase/migrations/202610290001_invitation_schema.sql`.
2. `supabase/migrations/202610290002_invitation_seed.sql`.

Migration đầu thêm 5 bảng, metadata và ràng buộc cho hai bảng cũ. Không xóa hoặc phân loại dữ liệu cũ; giữ quyền truy cập cũ ở giai đoạn này. Bảng khách và cấu hình mới chỉ máy chủ/quản trị truy cập.

Migration schema chỉ chạy một lần; chạy lại sẽ báo lỗi và rollback thay vì chấp nhận schema khác. Seed dùng `ON CONFLICT DO NOTHING`, không ghi đè bản đã sửa trong Table Editor. Mọi mẫu và nội dung được seed ở trạng thái draft.

Sửa nội dung ở `wedding_invitation_contents.content`; giữ đủ khóa như `data/invitation-copy.json`. Thay riêng đoạn cần sửa; không xóa các khóa nhãn giao diện. `wedding_events` chứa ngày giờ/địa điểm dùng chung. Đổi một sự kiện sẽ đổi lịch, countdown và bản đồ của các thiệp cùng tham chiếu đến nó.

## 3. Nhập khách mà không đổi link cũ

Danh sách thật nằm ngoài Git trong `.local/guests.csv` và script đã chuẩn bị `.local/import-guests.sql` trong môi trường làm việc này. File mẫu không có tên khách thật nằm ở `scripts/guests-template.csv`.

CSV cần guest_code,display_name,group_path. Giữ code khi sửa tên/sắp xếp dòng; thêm khách dùng code mới. Các nhóm cá nhân hợp lệ là groom/friends, bride/friends và bride/friends1.

```bash
npm run guests:prepare -- --file .local/guests.csv --output .local/import-guests.sql
```

Lệnh chỉ tạo SQL để duyệt, không kết nối DB; sẽ từ chối ghi đè file đã tồn tại. Sau khi duyệt, chạy file sinh ra trong SQL Editor. Nhập lại cập nhật tên nhưng giữ UUID và hash link; không xóa khách chỉ vì thiếu một dòng trong file. Việc chuyển một code sang nhóm khác bị từ chối để tránh thay đổi người nhận ngầm. Khách mới inactive cho đến khi cấp link.

## 4. Biến môi trường máy chủ

Trong Vercel → Project → Settings → Environment Variables, cấu hình theo môi trường Production/Preview:

| Biến | Giá trị/cách dùng |
| --- | --- |
| NEXT_PUBLIC_SUPABASE_URL | URL project đang dùng; máy chủ cũng có thể dùng biến này |
| SUPABASE_URL | Tùy chọn URL riêng cho server/CLI; nếu có sẽ ưu tiên dùng |
| SUPABASE_SERVICE_ROLE_KEY | Khóa máy chủ của đúng project, lưu bằng giao diện bảo mật |
| WEDDING_DATABASE_ENABLED | Không bắt buộc: tự bật khi có URL và khóa máy chủ. Đặt false để chủ động tắt kết nối DB |
| WEDDING_ALLOW_DRAFTS | false ở Production; có thể true trên local/Preview để đọc bản đang duyệt |

Giữ NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY nếu phần cũ hoặc công cụ khác vẫn dùng; ứng dụng thiệp mới không dùng khóa quản trị trong client bundle. Không cần gửi giá trị khóa vào chat.

Nếu chủ động đặt WEDDING_DATABASE_ENABLED=false hoặc thiếu cấu hình, trang đọc được bản dự phòng của đúng mẫu nhưng form không gửi được. Đây là chế độ xem thử, không phải đã kết nối dữ liệu thật. Vì bản mới chuyển form sang API, cần chuẩn bị cấu hình trước khi đưa lên main để tránh gián đoạn các form đang chạy.

DB mode có tác dụng với dữ liệu thật. Nếu đọc DB lỗi, thiệp hiển thị đúng bản dự phòng, không đoán danh tính khách và không báo thành công giả. Nếu một mẫu bị paused/chưa được duyệt thì API không cho ghi và trang DB mode không phát hành mẫu đó.

## 5. Duyệt nội dung và công bố mẫu

- Sau khi duyệt nội dung Việt: chạy `supabase/manual/05_publish_vietnamese.sql`. Chỉ công bố 5 mẫu Việt; Partron và UncleLEE vẫn draft.
- Để xem bản Hàn trước khi duyệt: dùng local/Preview với WEDDING_ALLOW_DRAFTS=true. Form của mẫu draft vẫn bị tắt.
- Sau khi vợ chủ thiệp duyệt/correct bản Hàn và bản Việt của Partron: chạy `supabase/manual/06_publish_korean.sql`.
- Partron chỉ công bố khi đủ bản Việt và Hàn đã duyệt; UncleLEE chỉ dùng Hàn.

Mã nguồn có bộ nội dung ban đầu làm dự phòng. Khi đã bật DB, các thay đổi nội dung/ngày giờ/tên khách ở DB được đọc lại khi tải trang; không cần deploy chỉ để đổi tên khách. Đổi environment variables cần redeploy Vercel.

## 6. Cấp link và giữ file gốc riêng

Đặt biến server trong môi trường máy cục bộ hoặc file `.env.local` được Git bỏ qua. Chọn base URL là tên miền dùng để gửi khách, không dùng URL của một deployment thử có thể bị thay thế.

```bash
# Mặc định chỉ đọc và báo số lượng dự kiến, không phát hành token.
npm run guests:links -- --base-url https://TEN-MIEN-CUA-BAN --output .local/invitation-links.json

# Chỉ sau khi duyệt danh sách mới thêm --write để kích hoạt link.
npm run guests:links -- --base-url https://TEN-MIEN-CUA-BAN --output .local/invitation-links.json --write
```

Tiện ích lưu token gốc ở file riêng trước khi kích hoạt trong DB; DB chỉ giữ hash. Có khóa file và ghi nguyên tử để tránh mất link khi lỗi mạng. Chạy lại giữ link đã cấp nếu còn file gốc; nếu không còn token gốc, tiện ích bỏ qua và không tự đổi link đang hoạt động. Cất giữ cả JSON và CSV xuất ra, không commit chúng.

Link cá nhân có dạng `/groom/friends?guest=<token>`. Tên URL không được dùng làm danh tính; link `?khach=` cũ chỉ phục vụ xem bản dự phòng khi chưa dùng DB. Số người điền trong RSVP độc lập với lời mời “và Gia Đình”.

## 7. Chuyển quyền sau khi API mới sẵn sàng

Khi ứng dụng mới đã được kiểm tra với DB thật, chạy `supabase/manual/04_server_api_cutover.sql`. Không chạy trước: form cũ còn gửi thẳng vào Supabase bằng public key sẽ không hoạt động sau bước này; các tab cũ cần tải lại ứng dụng mới.

Bước này bật RLS và thu hồi quyền bảng/sequence trực tiếp của PUBLIC, anon, authenticated; API dùng khóa máy chủ tiếp tục hoạt động. Các policy cũ không bị xóa để tiện đối chiếu. Chỉ thêm policy hạn chế sẽ không vô hiệu hóa một policy permissive cũ; vì vậy phải xem cả grants lẫn policies.

Dữ liệu lời chúc cũ chưa phân loại có host_side=NULL, được giữ lại nhưng không tự đẩy sang sổ cô dâu/chú rể. Chỉ phân loại theo các id đã được chủ thiệp xác nhận. UncleLEE luôn ghi host_side=bride và event_id=groom-wedding.

## 8. Kiểm tra, quay lại và giới hạn

Trước push main: `npm ci`, `npm run lint`, `npm run test:unit`, `npm run build`, `npm run test:browser`. Cần cài Chromium của Playwright bằng `npx playwright install chromium`, hoặc đặt PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium nếu máy đã có Chromium. Browser tests dựng DB PostgreSQL thử trong bộ nhớ và không ghi Supabase thật.

Các kiểm tra dùng máy chủ fixture localhost; không khởi động fixture ở production. Kiểm tra Supabase/Vercel thật được thực hiện riêng sau khi cấu hình và schema sẵn sàng.

Nếu cần rollback sau cutover, phục hồi đúng grants/policies đã lưu trước khi quay lại ứng dụng cũ; không GRANT rộng theo phỏng đoán. Không cần xóa các cột/bảng mới để rollback code. Giới hạn request trong API là best-effort theo tiến trình, không phải bộ giới hạn phân tán; nếu cần chống spam nhiều máy chủ, cấu hình thêm lớp rate limit ở nền tảng.
