type Props = {
  children?: React.ReactNode;
  className?: string;
};

const Container = ({ children, className = "" }: Props) => {
  return (
    <div className={`container mx-auto px-5 md:px-8 lg:px-12 max-w-7xl ${className}`}>
      {children}
    </div>
  );
};

export default Container;
