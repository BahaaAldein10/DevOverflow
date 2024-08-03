'use client';

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formUrlQuery } from '@/lib/utils';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

interface Props {
  filters: {
    name: string;
    value: string;
    flagSvg?: string;
    job_country?: string;
  }[];
  otherClasses?: string;
  containerClasses?: string;
  placeholder?: string;
}

const Filter = ({
  filters,
  otherClasses,
  containerClasses,
  placeholder = 'Select a Filter',
}: Props) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleChange = (value: string) => {
    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: 'filter',
      value,
    });

    router.push(newUrl, { scroll: false });
  };

  const param = searchParams.get('filter');

  return (
    <div className={`relative ${containerClasses}`}>
      <Select onValueChange={handleChange} defaultValue={param || undefined}>
        <SelectTrigger
          className={`${otherClasses} body-regular light-border background-light800_dark300 text-dark500_light700 border px-5 py-2.5`}
        >
          <div className="line-clamp-1 flex flex-1 items-center justify-start gap-2 text-left">
            <Image
              src="/assets/icons/location.svg"
              alt="location"
              width={24}
              height={24}
            />
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent className="text-dark500_light700 small-regular border-none bg-light-900 dark:bg-dark-300">
          <SelectGroup>
            {filters.map((item) => (
              <SelectItem
                key={item.value}
                value={item.value}
                className="cursor-pointer focus:bg-light-800 dark:focus:bg-dark-400"
              >
                <div className="flex-center gap-2">
                  {item.flagSvg && (
                    <Image
                      src={item.flagSvg}
                      alt={item.value}
                      width={24}
                      height={24}
                    />
                  )}

                  <p>{item.name}</p>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default Filter;
