import React from "react";
import { motion } from "framer-motion";
import { AiFillStar, AiOutlineFileText } from "react-icons/ai";

const RightEdgeTab = ({
  onClick,
  label = "Reviews",
  className = "",
  positionClass = "top-1/2",
  translateClass = "-translate-y-1/2",
  mobileVisible = false,
  style: styleOverride = {},
  icon: IconProp,
}) => {
  const DefaultIcon = React.useMemo(() => {
    if (/spec/i.test(label)) return AiOutlineFileText;
    return AiFillStar;
  }, [label]);
  const Icon = IconProp || DefaultIcon;
  return (
    <button
      aria-label={`Open ${label.toLowerCase()}`}
      onClick={onClick}
      className={`${mobileVisible ? "block" : "hidden lg:block"} fixed right-0 ${positionClass} ${translateClass} z-40 ${className}`}
      style={{ writingMode: "vertical-rl", ...styleOverride }}
    >
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="px-2 py-2 rounded-l-lg bg-secondary text-sm text-primary font-semibold shadow-lg hover:brightness-110 flex items-center gap-1"
      >
        <Icon className="w-4 h-4" />
        <span className="font-space">{label}</span>
      </motion.div>
    </button>
  );
};

export default RightEdgeTab;
