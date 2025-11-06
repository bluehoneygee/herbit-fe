import BottomNav from "@/components/navigation/BottomNav";
import HerbitAssistant from "@/components/floating-chat/HerbitAssistant";
import { DEFAULT_TABS } from "@/constants";
import React from "react";

const FeaturesLayout = ({ children }) => {
  return (
    <main>
      {children}
      <HerbitAssistant />
      <BottomNav tabs={DEFAULT_TABS} activeColor="#FEA800" />
    </main>
  );
};

export default FeaturesLayout;
