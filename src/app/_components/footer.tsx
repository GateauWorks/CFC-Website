import Container from "@/app/_components/container";

export function Footer() {
  return (
    <footer className="bg-neutral-50 border-t border-neutral-200 dark:bg-slate-800">
      <Container>
        <div className="py-16 flex flex-col lg:flex-row items-center justify-between">
          <div className="mb-6 lg:mb-0">
            <h3 className="text-2xl font-bold tracking-tight leading-tight text-center lg:text-left">
              Convoy for a Cause
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-2 text-center lg:text-left">
              Organizing rallies for a good cause. &copy;{" "}
              {new Date().getFullYear()} Convoy for a Cause. All rights
              reserved.
            </p>
          </div>
          <div className="flex flex-col lg:flex-row items-center gap-4">
            <a
              href="mailto:convoyforacause@gmail.com"
              className="mx-2 font-medium hover:underline"
            >
              Contact
            </a>
            <a
              href="https://www.instagram.com/convoyforacause/"
              target="_blank"
              rel="noopener noreferrer"
              className="mx-2 font-medium hover:underline"
            >
              Instagram
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}

export default Footer;
