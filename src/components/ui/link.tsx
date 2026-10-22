// eslint-disable-next-line no-restricted-imports -- this is the sanctioned wrapper
import NextLink from "next/link";
import type { ComponentProps } from "react";

type LinkProps<RouteType> = ComponentProps<typeof NextLink<RouteType>>;

function Link<RouteType>(props: LinkProps<RouteType>) {
  return <NextLink {...props} />;
}

export { Link, type LinkProps };
