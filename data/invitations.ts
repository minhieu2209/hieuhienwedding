import { weddingData } from "@/data/wedding";

type Side = "groom" | "bride";

type InvitationProfile = {
  side: Side;
  label: string;
  salutation: string;
  defaultRecipient: string;
  message: string;
};

// Mỗi đường dẫn có lời mời riêng. Có thể chỉnh nội dung tại đây.
export const invitationProfiles = {
  "groom/NGV": {
    side: "groom",
    label: "Thiệp mời đồng nghiệp của chú rể",
    salutation: "Trân trọng kính mời",
    defaultRecipient: "Công ty Cổ phần NGV",
    message:
      "Trân trọng kính mời toàn thể Anh/Chị/Em Công ty Cổ phần NGV tham dự ngày trọng đại của chúng em",
  },
  "groom/friends": {
    side: "groom",
    label: "Thiệp mời bạn của chú rể",
    salutation: "Thân mời",
    defaultRecipient: "Bạn thân yêu của Hiếu",
    message:
      "Hiếu thân mời bạn đến chung vui cùng Hiếu và Hiền trong ngày cưới. Có bạn bên cạnh, ngày đặc biệt của chúng mình sẽ càng trọn vẹn và đáng nhớ hơn!",
  },
  "bride/Partron": {
    side: "bride",
    label: "Thiệp mời đồng nghiệp của cô dâu",
    salutation: "Trân trọng kính mời",
    defaultRecipient: "Công ty Cổ phần Partron Vina",
    message:
      "Trân trọng kính mời toàn thể Anh/Chị/Em Công ty Cổ phần Partron Vina tham dự ngày trọng đại của chúng em",
  },
  "bride/friends": {
    side: "bride",
    label: "Thiệp mời bạn của cô dâu",
    salutation: "Thân mời",
    defaultRecipient: " Bạn thân yêu của Hiền",
    message:
      "Hiền thân mời bạn đến chung vui cùng Hiền và Hiếu trong ngày cưới. Mong được gặp bạn, cùng lưu lại những khoảnh khắc thật đẹp trong ngày vui của chúng mình!",
  },
} satisfies Record<string, InvitationProfile>;

export type InvitationId = keyof typeof invitationProfiles;
export type InvitationSearchParams = {
  [key: string]: string | string[] | undefined;
};

export function isInvitationId(value: string): value is InvitationId {
  return Object.hasOwn(invitationProfiles, value);
}

export function getInvitation(
  id: InvitationId,
  recipient?: string | string[],
) {
  const profile = invitationProfiles[id];
  const recipientName = (Array.isArray(recipient) ? recipient[0] : recipient)
    ?.trim()
    .replace(/\s+/g, " ")
    .slice(0, 120) || "";
  const sides: Side[] = profile.side === "groom"
    ? ["groom", "bride"]
    : ["bride", "groom"];
  const people = sides.map((side) => ({
    ...weddingData[side],
    side,
    role: side === "groom" ? "Chú rể" : "Cô dâu",
    image: `/images/couple/${side}.jpg`,
    description: side === "groom"
      ? "Chàng trai tin rằng những điều đẹp nhất trong cuộc sống trở nên ý nghĩa hơn khi được sẻ chia cùng người mình yêu."
      : "Cô gái tin vào những khoảnh khắc bình dị, những nụ cười chân thành và một hành trình dài được đồng hành bên người mình thương.",
  }));
  const event = weddingData.events[profile.side === "groom" ? 0 : 1];

  return {
    id,
    ...profile,
    recipientName,
    recipient: recipientName || profile.defaultRecipient,
    people,
    names: people.map((person) => person.fullName).join(" & "),
    namesWithDot: people.map((person) => person.fullName).join(" · "),
    families: sides.map((side, index) => ({
      ...weddingData.family[side],
      ...people[index],
    })),
    event,
    // Chỉ hiển thị giờ đã được ghi rõ cho sự kiện của bên gửi thiệp.
    timeline: [{
      time: event.time,
      title: event.type,
      description: `${event.venue} · ${event.address}`,
    }],
  };
}

export type Invitation = ReturnType<typeof getInvitation>;
export type InvitationProps = { invitation: Invitation };
