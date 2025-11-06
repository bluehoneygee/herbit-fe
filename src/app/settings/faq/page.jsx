import FAQ_ITEMS from "./faqItems";
import FAQContent from "./FAQContent";

export const metadata = {
  title: "FAQ Herbit",
};

export default function SettingsFAQPage() {
  return <FAQContent items={FAQ_ITEMS} />;
}
