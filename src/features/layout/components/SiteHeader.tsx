import { UserMenu } from "@/features/auth/components/UserMenu";
import { CartSheet } from "@/features/cart/components/CartSheet";
import { HeaderSearch } from "@/features/layout/components/HeaderSearch";
import { Logo } from "@/features/layout/components/Logo";
import { MainNav } from "@/features/layout/components/MainNav";
import { MobileNav } from "@/features/layout/components/MobileNav";
import { PageContainer } from "@/features/layout/components/PageContainer";
import { ThemeToggle } from "@/features/layout/components/ThemeToggle";
import { WishlistHeaderButton } from "@/features/wishlist/components/WishlistHeaderButton";

function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md">
      <PageContainer className="flex h-16 items-center gap-2 sm:gap-4">
        <MobileNav />
        <Logo />
        <MainNav className="hidden lg:flex" />
        <HeaderSearch className="ms-auto hidden max-w-xs md:block" />
        <div className="ms-auto flex items-center gap-0.5 md:ms-0">
          <ThemeToggle />
          <UserMenu />
          <WishlistHeaderButton />
          <CartSheet />
        </div>
      </PageContainer>
    </header>
  );
}

export { SiteHeader };
