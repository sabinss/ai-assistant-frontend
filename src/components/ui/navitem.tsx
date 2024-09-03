import useNavBarStore from "@/store/store";
import { LucideIcon } from "lucide-react";
import Link from "next/link";
interface NavItemProps {
  isActive: boolean;
  icon: LucideIcon; // Assuming LucideIcon is the type for Lucide icons
  path: string;
  name: string;
}

export default function NavItem({
  isActive,
  name,
  icon: Icon,
  path,
}: NavItemProps) {

  //to collapse sidebar when menu is clicked
  const { setCollapse } = useNavBarStore();
  const collapseIfMobile = () => {
    if (window.innerWidth < 640) {
      setCollapse();
    }
  }
  return (
    <Link href={path} onClick={collapseIfMobile}>
      <div className=" w-full flex">
        <div
          className={`flex py-3 px-4 w-full rounded-lg hover:bg-muted ${isActive ? "bg-[#174894]" : ""
            }`}
        >
          <span className="mr-4">
            <Icon size={20} color={isActive ? "white" : "#535353"} />
          </span>
          <span className={`text-sm ${isActive ? "text-white" : "text-[#535353]"}`}>
            {name}
          </span>
        </div>
      </div>
    </Link>
  );
};

