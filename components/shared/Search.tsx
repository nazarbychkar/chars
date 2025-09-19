import Image from "next/image";
import { useTheme } from "@/lib/ThemeProvider";

export default function Search() {
  const { isDark } = useTheme();

  return (
    <button
      className="cursor-pointer"
      // onClick={}
    >
      <Image
        height="32"
        width="32"
        alt="search"
        src={
          isDark
            ? "/images/dark-theme/search-dark.png"
            : "/images/light-theme/search-light.png"
        }
      />
    </button>
  );
}
