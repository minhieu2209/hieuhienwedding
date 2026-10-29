import assert from "node:assert/strict";
import test from "node:test";

// Run against a running development or production server.
const baseUrl = process.env.TEST_BASE_URL || "http://127.0.0.1:3000";

function text(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

async function load(path, recipient) {
  const url = new URL(path, baseUrl);
  if (recipient !== undefined) url.searchParams.set("khach", recipient);
  const response = await fetch(url);
  const html = await response.text();
  assert.equal(response.status, 200, path);
  const main = html.match(/<main>([\s\S]*?)<\/main>/)?.[1];
  assert.ok(main, "The invitation should render its content on the server");
  return { html, main, content: text(main) };
}

const variants = [
  {
    path: "/chu-re/cong-ty",
    names: "Minh Hiếu & Thu Hiền",
    firstFamily: "Nhà Trai",
    secondFamily: "Nhà Gái",
    date: "29 · 11 · 2026",
    venue: "Nhà hàng Chen 02 Nam Định",
    otherVenue: "Tư gia nhà gái",
    message: "Trân trọng kính mời toàn thể Anh/Chị/Em Công ty Cổ phần NGV tham dự ngày trọng đại của chúng em",
    defaultRecipient: "Công ty Cổ phần NGV",
  },
  {
    path: "/chu-re/ban-be",
    names: "Minh Hiếu & Thu Hiền",
    firstFamily: "Nhà Trai",
    secondFamily: "Nhà Gái",
    date: "29 · 11 · 2026",
    venue: "Nhà hàng Chen 02 Nam Định",
    otherVenue: "Tư gia nhà gái",
    message: "Hiếu thân mời bạn",
    defaultRecipient: "Những người bạn thân yêu của Hiếu",
  },
  {
    path: "/co-dau/ban-be",
    names: "Thu Hiền & Minh Hiếu",
    firstFamily: "Nhà Gái",
    secondFamily: "Nhà Trai",
    date: "28 · 11 · 2026",
    venue: "Tư gia nhà gái",
    otherVenue: "Nhà hàng Chen 02 Nam Định",
    message: "Hiền thân mời bạn",
    defaultRecipient: "Những người bạn thân yêu của Hiền",
  },
];

for (const variant of variants) {
  test(`${variant.path}: correct names, families, invitation and event`, async () => {
    const { html, main, content } = await load(variant.path);
    assert.equal(text(main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]), variant.names);
    const families = content.split("Trân trọng báo tin")[1].split("Wedding Events")[0];
    assert.ok(families.indexOf(variant.firstFamily) >= 0);
    assert.ok(families.indexOf(variant.firstFamily) < families.indexOf(variant.secondFamily));
    assert.ok(content.includes(variant.venue));
    assert.ok(!content.includes(variant.otherVenue));
    assert.ok(content.includes(variant.date));
    assert.ok(content.includes("10:00"));
    assert.ok(!content.includes("11:00"), "Do not reuse the other countdown/timeline time");
    assert.ok(content.includes(variant.message));
    assert.ok(content.includes(variant.defaultRecipient));
    assert.ok(text(html.match(/<title>([\s\S]*?)<\/title>/)[1]).includes(variant.names));
  });

  test(`${variant.path}: personalized Vietnamese recipient`, async () => {
    const { content } = await load(variant.path, "  Nguyễn   Ánh & gia đình  ");
    assert.ok(content.includes("Nguyễn Ánh & gia đình"));
    if (variant.path !== "/chu-re/cong-ty") {
      assert.ok(!content.includes(variant.defaultRecipient));
    }
  });

  test(`${variant.path}: empty recipient uses the default greeting`, async () => {
    const { content } = await load(variant.path, "   ");
    assert.ok(content.includes(variant.defaultRecipient));
  });
}

test("The original home URL remains a personalized groom invitation", async () => {
  const { main, content } = await load("/", "Bạn Nam");
  assert.equal(text(main.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1]), "Minh Hiếu & Thu Hiền");
  assert.ok(content.includes("Bạn Nam"));
});

test("Repeated guest parameters use the first recipient", async () => {
  const { content } = await load("/co-dau/ban-be?khach=Lan&khach=Mai");
  assert.ok(content.includes("Lan"));
  assert.ok(!content.includes("Mai"));
});

test("Recipient HTML is escaped rather than rendered as markup", async () => {
  const payload = '<script id="recipient-script">alert(1)</script>';
  const { main } = await load("/co-dau/ban-be", payload);
  assert.ok(!main.includes(payload));
  assert.ok(main.includes("&lt;script"));
});

for (const path of ["/co-dau/cong-ty", "/chu-re/khong-ton-tai", "/khong-ton-tai/ban-be", "/chu-re/__proto__"]) {
  test(`${path}: unsupported invitations return 404`, async () => {
    const response = await fetch(new URL(path, baseUrl));
    assert.equal(response.status, 404);
  });
}
