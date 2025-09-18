import Image from "next/image";
import { useTheme } from "@/lib/ThemeProvider";


export default function ShoppingBasket() {
const { isDark } = useTheme();

  return (
    <button
      className="cursor-pointer"
      // onClick={}
    >
      <Image
        height="32"
        width="32"
        alt="shopping basket"
        src={
          isDark
            ? "/images/dark-theme/shopping-basket-dark.png"
            : "/images/light-theme/shopping-basket-light.png"
        }
      />
    </button>
  );
}
