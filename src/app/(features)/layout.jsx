import BottomNav from "@/components/navigation/BottomNav";
import { DEFAULT_TABS } from "@/constants";
import React from "react";

const FeaturesLayout = ({ children }) => {
  return (
    <main>
      {children}
      <BottomNav tabs={DEFAULT_TABS} activeColor="#FEA800" />
    </main>
  );
};

export default FeaturesLayout;
