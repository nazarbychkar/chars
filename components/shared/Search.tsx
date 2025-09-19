import Image from "next/image";
import { useAppContext } from "@/lib/GeneralProvider";

export default function Search() {
  const { isDark } = useAppContext();

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
