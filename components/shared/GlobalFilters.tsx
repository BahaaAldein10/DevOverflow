'use client';

import { GlobalSearchFilters } from '@/constants/filters';
import { formUrlQuery, removeKeysFromQuery } from '@/lib/utils';
import { useRouter, useSearchParams } from 'next/navigation';

import { useState } from 'react';

function GlobalFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [active, setActive] = useState('');

  const handleTypeClick = (value: string) => {
    if (active === value) {
      setActive('');

      const newUrl = removeKeysFromQuery({
        params: searchParams.toString(),
        keysToRemove: ['type'],
      });

      router.push(newUrl, { scroll: false });
    } else {
      setActive(value);

      const newUrl = formUrlQuery({
        params: searchParams.toString(),
        key: 'type',
        value,
      });

      router.push(newUrl, { scroll: false });
    }
  };

  return (
    <div className="flex items-center gap-5 px-5">
      <p className="text-dark400_light900 body-medium">Type: </p>
      <div className="flex gap-3">
        {GlobalSearchFilters.map((item) => (
          <button
            type="button"
            key={item.value}
            className={`light-border-2 small-medium :text-light-800 rounded-2xl px-5 py-2 capitalize dark:hover:text-primary-500
              ${
                active === item.value
                  ? 'bg-primary-500 text-light-900'
                  : 'bg-light-700 text-dark-400 hover:text-primary-500 dark:bg-dark-500'
              }
            `}
            onClick={() => handleTypeClick(item.value)}
          >
            {item.name}
          </button>
        ))}
      </div>
    </div>
  );
}

export default GlobalFilters;
