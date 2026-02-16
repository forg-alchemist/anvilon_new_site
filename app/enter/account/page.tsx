import { getServerLang } from "@/lib/i18n/server";
import { getPublicStorageUrl } from "@/lib/supabase/publicUrl";
import AccountCabinetClient from "./AccountCabinetClient";

export default async function AccountPage() {
  const lang = await getServerLang();
  const isEn = lang === "en";

  const accountFrameUrl = getPublicStorageUrl("art", "page-art/AccountFrame.png");
  const foregroundUrl = getPublicStorageUrl("art", "page-art/AccountForeground.png");
  const inactiveButtonUrl = getPublicStorageUrl("art", "page-art/UnactiveButton.png");
  const activeButtonUrl = getPublicStorageUrl("art", "page-art/ActiveButton.png");
  const anvilIconUrl = getPublicStorageUrl("art", "page-art/Anvillcon.png");
  const anvilIconFallbackUrl = getPublicStorageUrl("art", "page-art/AnvilIcon.png");

  return (
    <AccountCabinetClient
      isEn={isEn}
      accountFrameUrl={accountFrameUrl}
      foregroundUrl={foregroundUrl}
      inactiveButtonUrl={inactiveButtonUrl}
      activeButtonUrl={activeButtonUrl}
      anvilIconUrl={anvilIconUrl}
      anvilIconFallbackUrl={anvilIconFallbackUrl}
    />
  );
}
