This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Các loại thiệp

| Đối tượng | Đường dẫn | Thứ tự tên / gia đình | Sự kiện |
| --- | --- | --- | --- |
| Công ty chú rể | `/chu-re/cong-ty` | Chú rể, cô dâu / nhà trai, nhà gái | Nhà trai |
| Bạn chú rể | `/chu-re/ban-be` | Chú rể, cô dâu / nhà trai, nhà gái | Nhà trai |
| Bạn cô dâu | `/co-dau/ban-be` | Cô dâu, chú rể / nhà gái, nhà trai | Nhà gái |

Thêm `?khach=` vào đường dẫn để ghi tên người hoặc nhóm được mời. Ví dụ:

```text
/chu-re/cong-ty?khach=Anh%20Nam
/chu-re/ban-be?khach=Tu%E1%BA%A5n%20v%C3%A0%20gia%20%C4%91%C3%ACnh
/co-dau/ban-be?khach=Lan
```

Có thể tạo phần query với `new URLSearchParams({ khach: "Tên khách" })` để mã hóa đúng dấu tiếng Việt và ký tự `&`. Nếu không có tên hoặc tên chỉ chứa khoảng trắng, thiệp dùng lời chào chung của nhóm. Tên được mời trên URL không phải cơ chế xác thực; khách có thể sửa lại tên khi xác nhận tham dự.

Lời mời cho mỗi nhóm nằm trong `data/invitations.ts`. Thiệp công ty dùng tên Công ty Cổ phần NGV và lời mời đã được chủ thiệp cung cấp. Ngày giờ, địa điểm nhà trai và nhà gái nằm trong hai mục `events` của `data/wedding.ts`: nhà trai 10:00 ngày 29/11/2026, nhà gái 10:00 ngày 28/11/2026. Thiệp công ty dùng cùng sự kiện với thiệp bạn chú rể. Lịch, đếm ngược và thông tin sự kiện đều lấy từ sự kiện được chọn; lịch trình chỉ hiển thị mốc có giờ đã xác định cho bên gửi thiệp. Khi có lịch trình chi tiết cho từng bên, bổ sung vào cấu hình thiệp thay vì dùng chung lịch trình cũ.

Đường dẫn `/` cũ vẫn hoạt động như thiệp bạn chú rể. Ba loại thiệp dùng chung album, nhạc, câu chuyện và sổ lưu bút. RSVP và lời chúc vẫn dùng các bảng Supabase hiện có, không yêu cầu thêm cột hoặc migration.

## Kiểm tra thiệp

Cài dependencies bằng `npm ci`. Cần có `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` qua môi trường hoặc file `.env.local` (không commit). Bản build cần truy cập Google Fonts.

```bash
npm run lint
npm run build
npm run start
```

Trong Terminal thứ hai, chạy `npm run test:smoke` để kiểm tra cả ba loại thiệp, tên khách, thứ tự gia đình, sự kiện, link cũ và URL không hợp lệ. Có thể đặt `TEST_BASE_URL` để kiểm tra một máy chủ khác. Bộ kiểm tra này không gửi RSVP hoặc ghi lời chúc vào Supabase.

## Cấu hình Vercel Preview

Trong Vercel → Project → Settings → Environment Variables, kiểm tra cả `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` đều được gán cho môi trường **Preview**, không chỉ Production. Dùng publishable key dành cho trình duyệt; không dùng service-role key. Sau khi đổi biến, cần redeploy vì Next.js đưa các biến `NEXT_PUBLIC_` vào mã trình duyệt ngay lúc build. Mở URL của deployment mới, vì URL deployment cũ không tự đổi theo cấu hình mới.

Nếu cấu hình Supabase thiếu hoặc sai định dạng, thiệp vẫn hiển thị, nhưng các nút gửi RSVP và lời chúc bị vô hiệu hóa kèm thông báo. Trạng thái Vercel Ready chỉ xác nhận deployment hoàn tất, không xác nhận cấu hình dữ liệu hoặc chức năng gửi form đã hoạt động.

Chạy `npm run test:config` bằng Node.js 24 để kiểm tra module Supabase với cấu hình thiếu URL, thiếu key, sai định dạng và cấu hình hợp lệ. Các kiểm tra dùng tiến trình riêng và không kết nối cơ sở dữ liệu.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
