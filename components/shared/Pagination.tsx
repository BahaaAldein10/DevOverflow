'use client';

import { formUrlQuery } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '../ui/button';

interface Props {
  pageNumber: number;
  isNext: boolean | undefined;
}

function Pagination({ pageNumber, isNext }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const handleNavigation = (value: string) => {
    const nextPageNumber = value === 'prev' ? pageNumber - 1 : pageNumber + 1;

    const newUrl = formUrlQuery({
      params: searchParams.toString(),
      key: 'page',
      value: nextPageNumber.toString(),
    });

    router.push(newUrl);
  };

  return (
    <div className="flex w-full items-center justify-center gap-2">
      <Button
        disabled={pageNumber === 1}
        onClick={() => handleNavigation('prev')}
        className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
      >
        <span className="body-medium text-dark200_light800 select-none">
          Prev
        </span>
      </Button>

      <div className="flex items-center justify-center rounded-md bg-primary-500 px-3.5 py-2">
        <span className="body-semibold select-none text-light-900">
          {pageNumber}
        </span>
      </div>

      <Button
        disabled={!isNext}
        onClick={() => handleNavigation('next')}
        className="light-border-2 btn flex min-h-[36px] items-center justify-center gap-2 border"
      >
        <span className="body-medium text-dark200_light800 select-none">
          Next
        </span>
      </Button>
    </div>
  );
}

export default Pagination;
