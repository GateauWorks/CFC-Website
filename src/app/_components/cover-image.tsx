import cn from "classnames";
import Link from "next/link";
import Image from "next/image";

type Props = {
  title: string;
  src: string;
  slug?: string;
  hero?: boolean;
};

const CoverImage = ({ title, src, slug, hero = false }: Props) => {
  const image = (
    <Image
      src={src}
      alt={`Cover Image for ${title}`}
      className={cn("shadow-sm w-full object-cover", {
        "hover:shadow-lg transition-shadow duration-200": slug,
        "h-64 md:h-80": !hero,
        "h-[500px] md:h-[600px] lg:h-[800px]": hero,
      })}
      width={1300}
      height={630}
    />
  );
  return (
    <div className="sm:mx-0">
      {slug ? (
        <Link href={`/posts/${slug}`} aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
};

export default CoverImage;
