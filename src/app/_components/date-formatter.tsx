import { formatDateCustom } from "@/lib/dateUtils";

type Props = {
  dateString: string;
};

const DateFormatter = ({ dateString }: Props) => {
  const formattedDate = formatDateCustom(dateString, { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  return <time dateTime={dateString}>{formattedDate}</time>;
};

export default DateFormatter;
