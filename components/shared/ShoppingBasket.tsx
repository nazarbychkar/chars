import Image from "next/image";
import { useAppContext } from "@/lib/GeneralProvider";


export default function ShoppingBasket() {
const { isDark } = useAppContext();

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
            ? "/images/dark-theme/basket.svg"
            : "/images/light-theme/basket.svg"
        }
      />
    </button>
  );
}
