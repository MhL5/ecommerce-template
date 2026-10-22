// eslint-disable-next-line no-restricted-imports -- this is the sanctioned wrapper
import NextImage from "next/image";
import type { ComponentProps } from "react";

type ImgProps = ComponentProps<typeof NextImage>;

function Img({ alt, ...props }: ImgProps) {
  return <NextImage alt={alt} {...props} />;
}

export { Img, type ImgProps };
