import Image from "next/image";

export default function Search() {
  return (
    <button className="cursor-pointer" onClick={}>
      <Image height="32" width="32" alt="search" src="/search.png" />
    </button>
  );
}
